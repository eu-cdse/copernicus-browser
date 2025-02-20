import React, { useState } from 'react';
import geo_area from '@mapbox/geojson-area';
import L from 'leaflet';
import { t } from 'ttag';
import store, { aoiSlice, mainMapSlice } from '../../../store';
import { EOBUploadGeoFile } from '../../../junk/EOBUploadGeoFile/EOBUploadGeoFile';
import { AOI_SHAPE } from '../../../const';
import { UPLOAD_GEOMETRY_TYPE } from '../../../junk/EOBUploadGeoFile/EOBUploadGeoFile.utils';
import { getBoundsAndLatLng } from '../../CommercialDataPanel/commercialData.utils';

export const AOISelection = ({ aoiGeometry, aoiIsDrawing, mapBounds }) => {
  const [uploadDialog, setUploadDialog] = useState(false);

  const onFileUpload = (geometry) => {
    const layer = L.geoJSON(geometry);
    store.dispatch(aoiSlice.actions.set({ geometry, bounds: layer.getBounds() }));
    setUploadDialog(false);

    const { lat, lng, zoom } = getBoundsAndLatLng(geometry);
    store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng, zoom: zoom }));
    store.dispatch(aoiSlice.actions.startDrawing({ isDrawing: false }));
  };

  const setCurrentDisplayArea = () => {
    if (mapBounds) {
      const geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [mapBounds._southWest.lng, mapBounds._southWest.lat],
            [mapBounds._northEast.lng, mapBounds._southWest.lat],
            [mapBounds._northEast.lng, mapBounds._northEast.lat],
            [mapBounds._southWest.lng, mapBounds._northEast.lat],
            [mapBounds._southWest.lng, mapBounds._southWest.lat],
          ],
        ],
      };
      store.dispatch(aoiSlice.actions.set({ geometry: geometry, bounds: mapBounds }));
    }
  };

  const formatArea = (geometry) => {
    const areaKm2 = parseFloat(geo_area.geometry(geometry)) / 1000000;
    if (areaKm2 < 0.01) {
      const areaM2 = areaKm2 * 1000000;
      return `${areaM2.toFixed(2)} ${t`m`}`;
    } else {
      return `${areaKm2.toFixed(2)} ${t`km`}`;
    }
  };

  return (
    <div className="row">
      <label title={t`Area of interest`}>{t`Area of interest`}</label>
      <div className="aoi-selection">
        <div className="aoi-text">
          {!!aoiGeometry ? (
            <span className="area-text">
              {formatArea(aoiGeometry)}
              <sup>2</sup>
            </span>
          ) : (
            <span>{t`Select`}:</span>
          )}
        </div>
        <div className="aoi-buttons">
          {!aoiGeometry && !aoiIsDrawing && (
            <>
              <i
                className="fa fa-television"
                title={t`Use current display area`}
                onClick={() => setCurrentDisplayArea()}
              />

              <i
                className="fa fa-upload"
                // jsx-a11y/anchor-is-valid
                // eslint-disable-next-line
                title={t`Upload a file to create an area of interest`}
                onClick={() => setUploadDialog(true)}
              />

              <i
                className="far fa-square"
                title={t`Draw rectangular area of interest`}
                onClick={() => {
                  store.dispatch(
                    aoiSlice.actions.startDrawing({ isDrawing: true, shape: AOI_SHAPE.rectangle }),
                  );
                }}
              />

              <i
                className="fa fa-pencil"
                title={t`Draw polygonal area of interest`}
                onClick={() => {
                  store.dispatch(
                    aoiSlice.actions.startDrawing({ isDrawing: true, shape: AOI_SHAPE.polygon }),
                  );
                }}
              />
            </>
          )}

          {(!!aoiGeometry || aoiIsDrawing) && (
            <i
              className="fa fa-close"
              title={t`Cancel`}
              onClick={() => store.dispatch(aoiSlice.actions.clearMap(true))}
            />
          )}

          {uploadDialog && (
            <EOBUploadGeoFile
              onUpload={onFileUpload}
              onClose={() => setUploadDialog(false)}
              type={UPLOAD_GEOMETRY_TYPE.POLYGON}
            />
          )}
        </div>
      </div>
    </div>
  );
};
