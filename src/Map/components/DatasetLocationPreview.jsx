import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { createPortal } from 'react-dom';
import { GeoJSON, FeatureGroup } from 'react-leaflet';
import Rodal from 'rodal';
import L from 'leaflet';

import './DatasetLocationPreview.scss';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { findLatestDateWithData } from '../../utils/latestDate.utils';
import { getOrbitDirectionFromList } from '../../Tools/VisualizationPanel/VisualizationPanel.utils';
import { getFromTime } from '../../components/VisualizationTimeSelect/VisualizationTimeSelect.utils';
import moment from 'moment';
import store, { mainMapSlice, visualizationSlice } from '../../store';
import { t } from 'ttag';
import { getBoundsAndLatLng } from '../../Tools/CommercialDataPanel/commercialData.utils';
import { datsetLocationPolygonStyle, highlightedTileStyle } from '../const';

/**
 * Helper function to extract Leaflet bounds from a polygon geometry
 * @param {Object} geometry - GeoJSON geometry object
 * @returns {L.LatLngBounds} Leaflet bounds object
 */
const getPolygonBounds = (geometry) => {
  if (!geometry || !geometry.coordinates) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const processCoordinates = (coords) => {
    if (Array.isArray(coords[0])) {
      // Multi-dimensional array, recurse
      coords.forEach(processCoordinates);
    } else {
      // Single coordinate pair [lng, lat]
      const [lng, lat] = coords;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  };

  processCoordinates(geometry.coordinates);

  // Create proper Leaflet LatLngBounds object
  return L.latLngBounds(
    L.latLng(minLat, minLng), // southwest corner
    L.latLng(maxLat, maxLng), // northeast corner
  );
};

/**
 * DatasetLocationPreview component displays static GeoJSON polygons on the map
 * based on the selected dataset. When a polygon is clicked, it shows metadata
 * and allows visualization of the latest data for that area.
 */

const DatasetLocationPreview = ({
  datasetId,
  zoom,
  maxCloudCover,
  orbitDirection,
  visibleOnMap,
  minZoom = 2,
  maxZoom = 10,
}) => {
  const [polygons, setPolygons] = useState([]);
  const [hoveredPolygonId, setHoveredPolygonId] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const getDataSourceMinZoom = useCallback(() => {
    const dsh = getDataSourceHandler(datasetId);
    if (dsh && typeof dsh.getLeafletZoomConfig === 'function') {
      const zoomConfig = dsh.getLeafletZoomConfig(datasetId);
      return zoomConfig?.min || 7; // Use min zoom from config, fallback to 7
    }
    return 7; // Default fallback
  }, [datasetId]);

  const shouldRender = zoom >= minZoom && zoom <= maxZoom && (!visibleOnMap || zoom < getDataSourceMinZoom());

  const loadPolygonsForDataset = useCallback(async (datasetId) => {
    try {
      // Get the data source handler for this dataset
      const dsh = getDataSourceHandler(datasetId);
      // Check if the handler has the getDatasetLocationPolygons
      if (!dsh) {
        setPolygons([]);
        return;
      }

      const polygonsData = await dsh.getDatasetLocationPolygons(datasetId);
      setPolygons(polygonsData || []);
    } catch (error) {
      console.error('Failed to load Evoland polygons:', error);
      setPolygons([]);
    }
  }, []);

  // Load polygons based on dataset
  useEffect(() => {
    if (!datasetId || !shouldRender) {
      setPolygons([]);
      return;
    }

    // Load Evoland polygons for the selected dataset
    loadPolygonsForDataset(datasetId);
  }, [datasetId, shouldRender, loadPolygonsForDataset]);

  // Event handlers
  const handlePolygonMouseOver = useCallback((e) => {
    const layer = e.layer;
    const feature = e.layer.feature;
    if (feature) {
      setHoveredPolygonId(feature.id);
      layer.setStyle(highlightedTileStyle);
      layer.bringToFront();
    }
  }, []);

  const handlePolygonMouseOut = useCallback((e) => {
    const layer = e.layer;
    setHoveredPolygonId(null);
    layer.setStyle(datsetLocationPolygonStyle);
  }, []);

  const handlePolygonClick = useCallback((e) => {
    const feature = e.layer.feature;
    if (feature) {
      setSelectedPolygon(feature);
      setModalOpened(true);
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpened(false);
    setSelectedPolygon(null);
    setErrorMessage(null);
  }, []);

  const zoomToGeometry = useCallback(
    (geometry) => {
      if (geometry) {
        const { lat, lng, zoom: lngLatZoom } = getBoundsAndLatLng(geometry);
        const dsh = getDataSourceHandler(datasetId);
        const { min: minZoom, max: maxZoom } = (dsh && dsh.getLeafletZoomConfig(datasetId)) || {};

        /*use best(highest) possible zoom calculated from 
        - current map zoom (.zoom), 
        - min zoom for selected layer(minZoom) 
        - zoom calculated from bounds(zoom)      
        */
        let newZoom = Math.max(minZoom, lngLatZoom, zoom);
        if (newZoom > maxZoom) {
          newZoom = maxZoom;
        }
        if (newZoom === minZoom) {
          newZoom = minZoom + 1;
        }
        store.dispatch(
          mainMapSlice.actions.setPosition({
            lat: lat,
            lng: lng,
            zoom: newZoom,
          }),
        );
      }
    },
    [datasetId, zoom],
  );

  const handleVisualize = useCallback(async () => {
    if (selectedPolygon) {
      try {
        const polygonBounds = getPolygonBounds(selectedPolygon.geometry);
        const latestDateWithAvailableData = await findLatestDateWithData({
          datasetId: datasetId,
          bounds: polygonBounds,
          maxCloudCoverPercent: maxCloudCover,
          orbitDirection: orbitDirection,
        });
        if (latestDateWithAvailableData) {
          zoomToGeometry(selectedPolygon.geometry);

          // Set visualization parameters with the latest date
          const date = moment(latestDateWithAvailableData);
          const minDate = moment.utc('1972-07-01');
          const fromTime = getFromTime(date, minDate);
          const toTime = date.clone().endOf('day');

          const dsh = getDataSourceHandler(datasetId);
          const finalFromTime = dsh && !dsh.supportsTimeRange() ? null : fromTime;

          store.dispatch(
            visualizationSlice.actions.setVisualizationParams({
              fromTime: finalFromTime,
              toTime: toTime,
              visibleOnMap: true,
            }),
          );

          setModalOpened(false);
          setSelectedPolygon(null);
          setErrorMessage(null);
        } else {
          setErrorMessage(t`No results found`);
        }
      } catch (e) {
        setErrorMessage(e);
      }
    }
  }, [selectedPolygon, datasetId, maxCloudCover, orbitDirection, zoomToGeometry]);

  // Style function that considers hover state
  const getFeatureStyle = useCallback(
    (feature) => {
      return hoveredPolygonId === feature.id ? highlightedTileStyle : datsetLocationPolygonStyle;
    },
    [hoveredPolygonId],
  );
  // Don't render if outside zoom range or no polygons
  if (!shouldRender || polygons.length === 0) {
    return null;
  }
  return (
    <>
      <FeatureGroup>
        {polygons.map((polygon) => (
          <GeoJSON
            key={polygon.id}
            data={polygon}
            style={getFeatureStyle}
            onMouseOver={handlePolygonMouseOver}
            onMouseOut={handlePolygonMouseOut}
            onClick={handlePolygonClick}
          />
        ))}
      </FeatureGroup>

      {modalOpened &&
        selectedPolygon &&
        createPortal(
          <Rodal
            animation="slideUp"
            visible={modalOpened}
            width={500}
            height={200}
            onClose={handleModalClose}
            closeOnEsc={true}
            className="observation-polygon-modal"
          >
            <div className="polygon-modal-header">
              <h3 className="polygon-modal-title">{selectedPolygon.properties.name}</h3>
            </div>

            <div className="polygon-modal-content">
              {errorMessage && (
                <div className="error-message">
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="polygon-metadata">
                <div className="metadata-item">
                  <label>{t`Dataset` + ':'}</label>
                  <span>{selectedPolygon.properties.dataset}</span>
                </div>

                <div className="metadata-item">
                  <label>{t`Description` + ':'}</label>
                  <span>{`${selectedPolygon.properties.description}${
                    selectedPolygon.properties.tile ? ` (${selectedPolygon.properties.tile})` : ''
                  }`}</span>
                </div>
              </div>

              <div className="polygon-modal-actions">
                <button className="visualize-button" onClick={handleVisualize}>
                  {t`Show latest date`}
                </button>
              </div>
            </div>
          </Rodal>,
          document.body,
        )}
    </>
  );
};

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  zoom: store.mainMap.zoom,
  maxCloudCover: store.visualization.cloudCoverage,
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
  visibleOnMap: store.visualization.visibleOnMap,
});

export default connect(mapStoreToProps)(DatasetLocationPreview);
