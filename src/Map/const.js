import { warningColor } from '../variables.module.scss';

export const highlightedTileStyle = {
  weight: 2,
  color: '#57de71',
  opacity: 1,
  fillColor: '#57de71',
  fillOpacity: 0.3,
};

// Style for dataset location polygons
export const datsetLocationPolygonStyle = {
  weight: 2,
  color: '#4285f4',
  opacity: 0.8,
  fillColor: '#4285f4',
  fillOpacity: 0.15,
  dashArray: '5, 5',
};

// Style for AOI (Area of Interest) polygons
export const aoiStyle = {
  color: warningColor,
  weight: 3,
  opacity: 1,
  fillColor: warningColor,
  fillOpacity: 0.2,
};

// Style for LOI (Line of Interest)
export const loiStyle = {
  color: warningColor,
  weight: 3,
  opacity: 1,
};
