import toGeoJSON from '@mapbox/togeojson';
import { parse as parseWKT } from 'wellknown';
import bboxPolygon from '@turf/bbox-polygon';
import { t } from 'ttag';
import union from '@turf/union';
import { coordEach } from '@turf/meta';
import JSZip from 'jszip';

const uploadGeoFileErrorMessages = {
  UNSUPORTED_FILE_TYPE: () => t`File type not supported`,
  ERROR_PARSING_FILE: () => t`There was a problem parsing the file`,
  ERROR_PARSING_GEOMETRY: () => t`There was a problem parsing input geometry`,
  UNSUPORTED_GEOJSON_TYPE: (
    supportedGeometryTypes = SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
  ) => {
    const supported = supportedGeometryTypes.join(', ');
    return t`Unsupported GeoJSON geometry type! Only ${supported} are supported.`;
  },
};

const UPLOAD_GEOMETRY_TYPE = {
  POLYGON: 'POLYGON',
  LINE: 'LINE',
};

const SUPPORTED_GEOMETRY_TYPES = {
  [UPLOAD_GEOMETRY_TYPE.POLYGON]: ['Polygon', 'MultiPolygon'],
  [UPLOAD_GEOMETRY_TYPE.LINE]: ['LineString', 'MultiLineString'],
};

const isValidBbox = (inputArr) => inputArr && inputArr.length === 4 && !inputArr.some((e) => isNaN(e));

const isValidGeoJson = (json) =>
  json &&
  json.type &&
  [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection',
    'Feature',
    'FeatureCollection',
  ].includes(json.type);

const validateGeometryTypes = (geometries, supportedGeometryTypes) => {
  if (!(geometries && geometries.every((geometry) => supportedGeometryTypes.includes(geometry.type)))) {
    throw new Error(uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(supportedGeometryTypes));
  }
};

const createPolygonsUnion = (geometries) => {
  let multipolygon = geometries[0];
  for (let i = 1; i < geometries.length; i++) {
    multipolygon = union(multipolygon, geometries[i]).geometry;
  }
  return multipolygon;
};

const createLinesUnion = (geometries) => {
  if (geometries.length <= 1) {
    return geometries[0];
  }
  const coordinates = [];
  geometries.forEach((geom) => {
    if (geom.type === 'LineString') {
      coordinates.push(geom.coordinates);
    } else if (geom.type === 'MultiLineString') {
      coordinates.push(...geom.coordinates);
    }
  });
  return { type: 'MultiLineString', coordinates: coordinates };
};

const createUnion = (geometries, type) => {
  if (!(geometries && Array.isArray(geometries) && geometries.length)) {
    return null;
  }

  switch (type) {
    case UPLOAD_GEOMETRY_TYPE.LINE:
      return createLinesUnion(geometries);
    case UPLOAD_GEOMETRY_TYPE.POLYGON:
      return createPolygonsUnion(geometries);
    default:
      return null;
  }
};

const extractGeometriesFromGeoJson = (geoJson, supportedGeometryTypes) => {
  if (!(geoJson && isValidGeoJson(geoJson))) {
    throw new Error(uploadGeoFileErrorMessages.ERROR_PARSING_FILE);
  }

  let geometries;

  switch (geoJson.type) {
    case 'Feature':
      geometries = [geoJson.geometry];
      break;
    case 'FeatureCollection':
      geometries = geoJson.features.map((feature) => feature.geometry);
      break;
    case 'GeometryCollection':
      geometries = geoJson.geometries;
      break;
    default:
      geometries = [geoJson];
      break;
  }
  validateGeometryTypes(geometries, supportedGeometryTypes);
  return geometries;
};

const removeExtraCoordDimensionsIfNeeded = (geometry) => {
  if (!geometry) {
    return null;
  }

  if (!isValidGeoJson(geometry)) {
    throw new Error(uploadGeoFileErrorMessages.ERROR_PARSING_GEOMETRY());
  }

  coordEach(geometry, (coord) => {
    while (coord.length > 2) {
      coord.pop();
    }
  });

  return geometry;
};

const getFileExtension = (filename) => filename.toLowerCase().split('.').pop();

const convertKmlToGeoJson = (input) => {
  const xml = new DOMParser().parseFromString(input, 'text/xml');
  const kml = toGeoJSON.kml(xml);
  return kml && kml.features && kml.features.length ? kml : null;
};

const conversionFunctions = {
  wkt: (input) => {
    if (!input) {
      return null;
    }
    return parseWKT(input);
  },
  bbox: (input) => {
    if (!input) {
      return null;
    }
    const arr = JSON.parse(input);
    if (!isValidBbox(arr)) {
      return null;
    }
    return bboxPolygon(arr);
  },
  geojson: (input) => {
    let geoJson = JSON.parse(input);
    if (!isValidGeoJson(geoJson)) {
      return null;
    }
    return geoJson;
  },
  json: (input) => {
    let geoJson = JSON.parse(input);
    if (!isValidGeoJson(geoJson)) {
      return null;
    }
    return geoJson;
  },
  kml: (input) => convertKmlToGeoJson(input),
  gpx: (input) => {
    const xml = new DOMParser().parseFromString(input, 'text/xml');
    const gpx = toGeoJSON.gpx(xml);
    return gpx && gpx.features && gpx.features.length ? gpx : null;
  },

  // kmz is an archive, we only take kml file from it and try to convert it to geoJson
  kmz: (input) => convertKmlToGeoJson(input),
};

const isFileTypeSupported = (format) => !!conversionFunctions[format];

const convertToGeoJson = (data, format = null) => {
  let geoJson;
  if (format) {
    // use appropriate convert function when format is provided
    geoJson = conversionFunctions[format](data);
  } else {
    // iterate over all supported formats and use first one that returns something
    for (let format of Object.keys(conversionFunctions)) {
      try {
        geoJson = conversionFunctions[format](data);
        if (!!geoJson) {
          break;
        }
      } catch (err) {
        // ignore parsing errors and try with next format
      }
    }
  }

  if (!geoJson) {
    throw new Error(
      !!format
        ? uploadGeoFileErrorMessages.ERROR_PARSING_FILE()
        : uploadGeoFileErrorMessages.ERROR_PARSING_GEOMETRY(),
    );
  }

  return geoJson;
};

const parseContent = (data, type = UPLOAD_GEOMETRY_TYPE.POLYGON, format = null) => {
  let geoJson = convertToGeoJson(data, format);
  const geometries = extractGeometriesFromGeoJson(geoJson, SUPPORTED_GEOMETRY_TYPES[type]);
  const geometriesWithoutZ = geometries.map((geometry) => removeExtraCoordDimensionsIfNeeded(geometry));
  const union = createUnion(geometriesWithoutZ, type);
  return union;
};

const loadFileContent = async (file, format) => {
  if (!isFileTypeSupported(format)) {
    throw new Error(uploadGeoFileErrorMessages.UNSUPORTED_FILE_TYPE());
  }

  return new Promise((resolve) => {
    if (format === 'kmz') {
      // kmz is an archive, we only take kml file from it and try to convert it to geoJson
      JSZip.loadAsync(file).then((zip) => {
        zip
          .file(Object.keys(zip.files).find((f) => f.includes('.kml')))
          .async('string')
          .then((data) => resolve(data));
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    }
  });
};

export {
  uploadGeoFileErrorMessages,
  getFileExtension,
  isFileTypeSupported,
  parseContent,
  loadFileContent,
  UPLOAD_GEOMETRY_TYPE,
  SUPPORTED_GEOMETRY_TYPES,
  extractGeometriesFromGeoJson,
  createUnion,
  removeExtraCoordDimensionsIfNeeded,
};
