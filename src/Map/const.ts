import styles from '../variables.module.scss';

const { warningColor } = styles;

type PathStyle = {
  weight?: number;
  color?: string;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  dashArray?: string;
};

export const highlightedTileStyle: PathStyle = {
  weight: 2,
  color: '#57de71',
  opacity: 1,
  fillColor: '#57de71',
  fillOpacity: 0.3,
};

// Style for dataset location polygons
export const datasetLocationPolygonStyle: PathStyle = {
  weight: 2,
  color: '#4285f4',
  opacity: 0.8,
  fillColor: '#4285f4',
  fillOpacity: 0.15,
  dashArray: '5, 5',
};

// Style for AOI (Area of Interest) polygons
export const aoiStyle: PathStyle = {
  color: warningColor,
  weight: 3,
  opacity: 1,
  fillColor: warningColor,
  fillOpacity: 0.2,
};

// Style for LOI (Line of Interest)
export const loiStyle: PathStyle = {
  color: warningColor,
  weight: 3,
  opacity: 1,
};
