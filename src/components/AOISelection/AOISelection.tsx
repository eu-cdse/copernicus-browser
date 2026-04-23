import React, { useState } from 'react';
import type { Geometry } from 'geojson';
import type { PluggableList } from 'unified';
import geo_area from '@mapbox/geojson-area';
import bbox from '@turf/bbox';
import L from 'leaflet';
import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';
import ReactMarkdown from 'react-markdown';
import './AOISelection.scss';
import store, { aoiSlice, mainMapSlice } from '../../store';
import { EOBUploadGeoFile } from '../../junk/EOBUploadGeoFile/EOBUploadGeoFile';
import { AOI_SHAPE } from '../../const';
import { UPLOAD_GEOMETRY_TYPE } from '../../junk/EOBUploadGeoFile/EOBUploadGeoFile.utils';
import { getBoundsAndLatLng } from '../../Tools/CommercialDataPanel/commercialData.utils';
import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../rehypeConfig';
import { getUtmZoneLabel } from '../../utils/utm';

type Props = {
  aoiGeometry: Geometry | null | undefined;
  aoiIsDrawing: boolean;
  mapBounds: L.LatLngBounds | null | undefined;
};

export const AOISelection = ({ aoiGeometry, aoiIsDrawing, mapBounds }: Props) => {
  const [uploadDialog, setUploadDialog] = useState(false);

  const aoiTooltipText = t`AOI polygon constraints apply (polygon unicity, shape and size). See the [user manual](https://info.rapidresponse.copernicus.eu) for details.`;

  const onFileUpload = (geometry: Geometry) => {
    const layer = L.geoJSON(geometry);
    store.dispatch(aoiSlice.actions.set({ geometry, bounds: layer.getBounds() }));
    setUploadDialog(false);

    const { lat, lng, zoom } = getBoundsAndLatLng(geometry);
    store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng, zoom: zoom }));
    store.dispatch(aoiSlice.actions.startDrawing({ isDrawing: false }));
  };

  const setCurrentDisplayArea = () => {
    if (mapBounds) {
      const sw = mapBounds.getSouthWest();
      const ne = mapBounds.getNorthEast();
      const geometry: Geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [sw.lng, sw.lat],
            [ne.lng, sw.lat],
            [ne.lng, ne.lat],
            [sw.lng, ne.lat],
            [sw.lng, sw.lat],
          ],
        ],
      };
      store.dispatch(aoiSlice.actions.set({ geometry, bounds: mapBounds }));
    }
  };

  const formatUtmZone = (geometry: Geometry): string => {
    const [minX, minY, maxX, maxY] = bbox(geometry);
    return getUtmZoneLabel(new BBox(CRS_EPSG4326, minX, minY, maxX, maxY));
  };

  const formatArea = (geometry: Geometry): string => {
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
      <div className="aoi-label-wrapper">
        <label title={`${t`Area of interest`}`}>{`${t`Area of interest`}:`}</label>
        <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
          <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS as PluggableList}>
            {aoiTooltipText}
          </ReactMarkdown>
        </HelpTooltip>
      </div>
      <div className="aoi-selection">
        {!!aoiGeometry && (
          <div className="aoi-text">
            <span className="area-text">
              {formatArea(aoiGeometry)}
              <sup>2</sup>
            </span>
            <span className="utm-zone-text">{formatUtmZone(aoiGeometry)}</span>
          </div>
        )}
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
