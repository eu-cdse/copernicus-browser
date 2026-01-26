import toGeoJSON from '@mapbox/togeojson';
import { parse as parseWKT } from 'wellknown';
import bboxPolygon from '@turf/bbox-polygon';
import { t } from 'ttag';
import union from '@turf/union';
import { coordEach } from '@turf/meta';
import JSZip from 'jszip';
import shp from 'shpjs';
import { getMgrsBounds } from '../../utils/mgrs';
import { getGeoRefBounds } from '../../utils/georef';

const uploadGeoFileErrorMessages = {
  UNSUPORTED_FILE_TYPE: () => t`File type not supported`,
  ERROR_PARSING_FILE: () => t`There was a problem parsing the file`,
  ERROR_PARSING_SHP: () => t`There was a problem parsing the shp file`,
  INVALID_SHP_CONTENT: () => t`The .zip file is missing content. The .prj and .shp files are required`,
  INVALID_PROJECTION: () => t`Invalid geodetic system detected`,
  ERROR_PARSING_GEOMETRY: () => t`There was a problem parsing input geometry`,
  UNSUPORTED_GEOJSON_TYPE: (
    supportedGeometryTypes = SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
  ) => {
    const supported = supportedGeometryTypes.join(', ');
    return t`Unsupported GeoJSON geometry type! Only ${supported} are supported.`;
  },
};

const SHAPEFILE_UPLOAD_EXPECTED_FILES = ['shp', 'prj'];

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

function ensureKmlNamespaces(kmlString) {
  // Add missing main KML namespace
  if (!kmlString.includes('xmlns="http://www.opengis.net/kml/2.2"')) {
    kmlString = kmlString.replace(/<kml([^>]*)>/, '<kml$1 xmlns="http://www.opengis.net/kml/2.2">');
  }
  // Add missing Google extension
  if (!kmlString.includes('xmlns:gx=')) {
    kmlString = kmlString.replace(/<kml([^>]*)>/, '<kml$1 xmlns:gx="http://www.google.com/kml/ext/2.2">');
  }
  // Add missing KML alias
  if (!kmlString.includes('xmlns:kml=')) {
    kmlString = kmlString.replace(/<kml([^>]*)>/, '<kml$1 xmlns:kml="http://www.opengis.net/kml/2.2">');
  }
  // Add missing Atom namespace
  if (!kmlString.includes('xmlns:atom=')) {
    kmlString = kmlString.replace(/<kml([^>]*)>/, '<kml$1 xmlns:atom="http://www.w3.org/2005/Atom">');
  }
  // Add missing XSI namespace
  if (!kmlString.includes('xmlns:xsi=')) {
    kmlString = kmlString.replace(
      /<kml([^>]*)>/,
      '<kml$1 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    );
  }
  return kmlString;
}

const convertKmlToGeoJson = (input) => {
  // Preprocess KML string to ensure required namespaces
  const fixedInput = ensureKmlNamespaces(input);
  const xml = new DOMParser().parseFromString(fixedInput, 'text/xml');
  const kml = toGeoJSON.kml(xml);
  return kml?.features?.length ? kml : null;
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
  mgrs: (input) => getMgrsBounds(input),
  geoRef: (input) => getGeoRefBounds(input),
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
  return getUnion(geoJson, type);
};

const parseZip = async (zipFile, type = UPLOAD_GEOMETRY_TYPE.POLYGON) => {
  // shp files only
  try {
    const arrayBuffer = await readFileAsArrayBuffer(zipFile);
    const geoJson = await shp(arrayBuffer);
    return getUnion(geoJson, type);
  } catch (error) {
    throw new Error(uploadGeoFileErrorMessages.ERROR_PARSING_SHP());
  }
};

const getUnion = (geoJson, type) => {
  const geometries = extractGeometriesFromGeoJson(geoJson, SUPPORTED_GEOMETRY_TYPES[type]);
  const geometriesWithoutZ = geometries.map((geometry) => removeExtraCoordDimensionsIfNeeded(geometry));
  return createUnion(geometriesWithoutZ, type);
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
    } else if (format === 'zip') {
      // do nothing
    } else {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    }
  });
};

async function checkIfValidShapeFile(file) {
  try {
    const jszip = new JSZip();

    const zip = await jszip.loadAsync(file);

    const files = Object.keys(zip.files);

    if (files.length > 0) {
      // get all consideredFiles
      const consideredFiles = files.filter((tempFile) => {
        const fileType = tempFile.split('.').pop();
        if (fileType) {
          return SHAPEFILE_UPLOAD_EXPECTED_FILES.some((type) => fileType === type);
        } else {
          return false;
        }
      });

      // check if prj. has EPSG:4326/GCS_WGS_1984
      await Promise.all(
        consideredFiles.map(async (tempFile) => {
          try {
            const fileType = tempFile.split('.').pop();
            await isEPSG4326UsedInPrjFile(zip, tempFile, fileType);
          } catch (error) {
            throw new Error(`Error validating file ${tempFile}: ${error.message}`);
          }
        }),
      );

      if (consideredFiles.length === 2) {
        return;
      } else {
        throw uploadGeoFileErrorMessages.INVALID_SHP_CONTENT();
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(error);
    }
  }
}

async function isEPSG4326UsedInPrjFile(zip, tempFile, fileType) {
  if (!fileType.includes(SHAPEFILE_UPLOAD_EXPECTED_FILES[1])) {
    return;
  }
  try {
    const content = await zip.file(tempFile).async('text');
    if (content.includes(`GEOGCS["GCS_WGS_1984"`) || content.includes(`GEOGCS["EPSG:4326"`)) {
      return;
    } else {
      throw uploadGeoFileErrorMessages.INVALID_PROJECTION();
    }
  } catch (error) {
    throw new Error(`Error reading projection file ${tempFile}: ${error.message}`);
  }
}

async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export {
  uploadGeoFileErrorMessages,
  getFileExtension,
  isFileTypeSupported,
  parseContent,
  parseZip,
  loadFileContent,
  UPLOAD_GEOMETRY_TYPE,
  SUPPORTED_GEOMETRY_TYPES,
  extractGeometriesFromGeoJson,
  createUnion,
  removeExtraCoordDimensionsIfNeeded,
  checkIfValidShapeFile,
};
