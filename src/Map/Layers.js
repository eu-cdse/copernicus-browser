import { t } from 'ttag';

import { S2QuarterlyCloudlessMosaicsBaseLayerTheme } from '../assets/default_themes';
import { getFromLocalStorage } from '../utils/localStorage.utils';
import { OSM_BACKGROUND_NAME as OSM_BACKGROUND_ID, SELECTED_BASE_LAYER_KEY } from '../const';

const MAPS_LABELS_DISCLAIMER = t`The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the European Union concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries. Kosovo*: This designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo declaration of independence. Palestine*: This designation shall not be construed as recognition of a State of Palestine and is without prejudice to the individual positions of the Member States on this issue.`;

export const baseLayers = [
  {
    id: OSM_BACKGROUND_ID,
    name: 'OSM Background',
    url: `https://gisco-services.ec.europa.eu/maps/tiles/OSMCartoBackground/EPSG3857/{z}/{x}/{y}.png`,
    attribution: `\u003ca href="https://www.openstreetmap.org/copyright" target="_blank" \u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e - \u003ca href="#" title="${MAPS_LABELS_DISCLAIMER}"\u003eDisclaimer\u003c/a\u003e`,
    urlType: 'WMTS',
  },
  ...(S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0]
    ? [
        {
          id: S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].id,
          name: S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].name,
          url: S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].url,
          urlType: 'BYOC',
        },
      ]
    : []),
];

export const getDefaultBaseLayer = () => {
  return baseLayers.find((layer) => layer.id === OSM_BACKGROUND_ID);
};

export const getInitialBaseLayerId = () => {
  const savedBaseLayerId = getFromLocalStorage(SELECTED_BASE_LAYER_KEY);
  const isSavedLayerValid = baseLayers.some((baseLayer) => baseLayer.id === savedBaseLayerId);

  if (isSavedLayerValid) {
    return savedBaseLayerId;
  }

  // Fallback to a default if the saved one is not valid
  const defaultBaseLayerId = S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0]
    ? S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].id
    : OSM_BACKGROUND_ID;
  return defaultBaseLayerId;
};

// The overlays from maptiler are vector tiles which makes fewer requests than image tiles
export const overlayTileLayers = () => [
  {
    id: 'labels',
    name: t`Labels`,
    url: `https://gisco-services.ec.europa.eu/maps/tiles/OSMCartoLabelsEN/EPSG3857/{z}/{x}/{y}.png`,
    attribution: `\u003ca href="https://www.openstreetmap.org/copyright" target="_blank" \u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e - \u003ca href="#" title="${MAPS_LABELS_DISCLAIMER}"\u003eDisclaimer\u003c/a\u003e`,
    urlType: 'WMTS',
    zIndex: 22,
    pane: 'labels',
    preserveDrawingBuffer: true,
  },
  {
    id: 'countryBorders',
    name: t`Country Borders`,
    attribution: `<a href="https://ec.europa.eu/eurostat/web/gisco" target="_blank">© GISCO</a>`,
    urlType: 'VECTOR',
    subType: 'GISCO_BORDERS',
    zIndex: 20,
    pane: 'countryBorders',
    preserveDrawingBuffer: true,

    style: {
      version: 8,
      sources: {
        countryBorders: {
          type: 'vector',
          tiles: ['https://gisco-services.ec.europa.eu/vectortiles/gisco.countries_bn_2024/{z}/{x}/{y}.pbf'],
          maxzoom: 18,
        },
      },
      layers: [
        {
          id: 'country-borders',
          type: 'line',
          source: 'countryBorders',
          'source-layer': 'gisco.countries_bn_2024',
          layout: { visibility: 'visible' },
          paint: {
            'line-color': '#000000',
            'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.5, 6, 1.2, 12, 2.6],
            'line-opacity': 0.5,
          },
          minzoom: 2,
        },
      ],
    },
  },
];
