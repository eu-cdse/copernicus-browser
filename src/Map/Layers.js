import { t } from 'ttag';

import { S2QuarterlyCloudlessMosaicsBaseLayerTheme } from '../assets/default_themes';

export const LAYER_ACCESS = {
  PUBLIC: 'public',
  PAID: 'paid',
};

const MAPS_LABELS_DISCLAIMER = t`The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the European Union concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries. Kosovo*: This designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo declaration of independence. Palestine*: This designation shall not be construed as recognition of a State of Palestine and is without prejudice to the individual positions of the Member States on this issue.`;

export const baseLayers = [
  {
    id: 'osm-background',
    name: 'OSM Background',
    url: `https://gisco-services.ec.europa.eu/maps/tiles/OSMCartoBackground/EPSG3857/{z}/{x}/{y}.png`,
    attribution: `\u003ca href="https://www.openstreetmap.org/copyright" target="_blank" \u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e - \u003ca href="#" title="${MAPS_LABELS_DISCLAIMER}"\u003eDisclaimer\u003c/a\u003e`,
    urlType: 'WMTS',
    access: LAYER_ACCESS.PUBLIC,
    checked: !S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0],
  },
  {
    id: 'google-satellite',
    name: 'Google Satellite',
    url: `https://1.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/512/png8?apiKey=7zZjn-HKgDIEjDpbD9hGavCHjAnrTwYckBc1AX0mwwc`,
    urlType: 'GOOGLE_MAPS',
    access: LAYER_ACCESS.PAID,
  },
  ...(S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0]
    ? [
        {
          id: S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].name,
          name: S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].label,
          url: S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].url,
          urlType: 'BYOC',
          access: LAYER_ACCESS.PUBLIC,
          checked: true,
        },
      ]
    : []),
];

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
];
