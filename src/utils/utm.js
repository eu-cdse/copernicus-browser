export const HEMISPHERES = {
  N: 'N',
  S: 'S',
};

export const UTM_EPSG_CODE_BASES = {
  N: '326',
  S: '327',
};

/**
 * A UtmZoneObject
 * @typedef {Object} UtmZoneObject
 * @property {number} zone - The utm zone, 1-60
 * @property {string} hemisphere - The hemipshere the zone is in, either N or S
 */

/**
 * Function for getting UTM zone and hemisphere from a bbox
 *
 * @param {BBox} bbox - sentinelhub BBox
 * @return {UtmZoneObject} An object containing zone and hemisphere
 *
 * @example
 *
 *    getUtmZoneFromBounds(new BBox(CRS_EPSG4326, 1, 2, 2, 3))
 */
export const getUtmZoneFromBbox = (bbox) => {
  const center = [(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2];
  const zone = ((30 + Math.floor(center[0] / 6.0)) % 60) + 1;
  return {
    zone: zone,
    hemisphere: center[1] >= 0 ? HEMISPHERES.N : HEMISPHERES.S,
  };
};

/**
 * Returns the CRS code for the UtmZoneObject
 * @param {UtmZoneObject} utmZoneObject - The {@link UtmZoneObject} to be played
 * @return {string} CRS code -  http://www.opengis.net/def/crs/EPSG/0/3857
 * @example
 *  getUtmEpsgCode({zone: 3, hemisphere: 'N'})
 */
export const getUtmEpsgCode = (utmZoneObject) => {
  if (utmZoneObject.zone > 60 || utmZoneObject.zone < 1) {
    throw new Error(`Found zone ${utmZoneObject.zone}, which is not a valid UTM zone`);
  }
  const paddedZone = String('0' + utmZoneObject.zone).slice(-2);
  return UTM_EPSG_CODE_BASES[utmZoneObject.hemisphere] + paddedZone;
};

/**
 * Returns a sentinelhub-js CRS object with the UTM zone and EPSG code for a provided bbox
 * @param {BBox} bbox
 * @return {CRS} CRS code
 * @example
 *
 *    getUtmCrsFromBbox(new BBox(CRS_EPSG4326, 1, 2, 2, 3))
 */
export const getUtmCrsFromBbox = (bbox) => {
  const utmZoneObject = getUtmZoneFromBbox(bbox);
  const epsgCode = getUtmEpsgCode(utmZoneObject);
  return `EPSG:${epsgCode}`;
};

/**
 * Function to check if an authId is UTM.
 * Function assumes UTM epsg codes rage from 32601-32660 for nothern hepispheres and 32701-32760 for southern hemispheres
 * @param {string} authId An authId
 * @return {boolean} CRS code
 *  @example
 *
 *    isAuthIdUtm('EPSG:4326')
 */
export const isAuthIdUtm = (authId) => {
  const epsgCode = Number(authId.split('EPSG:')[1]);

  return (
    (epsgCode >= Number(UTM_EPSG_CODE_BASES.N + '01') && epsgCode <= Number(UTM_EPSG_CODE_BASES.N + '60')) ||
    (epsgCode >= Number(UTM_EPSG_CODE_BASES.S + '01') && epsgCode <= Number(UTM_EPSG_CODE_BASES.S + '60'))
  );
};

/**
 * Returns a list UTM CRSes for a zone
 * @param {HEMISPHERES} hemipshere - The {@link HEMISPHERES} to be played
 * @return {CRS[]}
 * @example
 *  createUtmCrsListPerHemisphere(HEMISPHERE.N)
 */
export const createUtmCrsListPerHemisphere = (hemisphere) => {
  return Array.from(Array(60).keys()).reduce((previousValue, iterator) => {
    const zone = iterator + 1;
    const paddedZone = String('0' + zone).slice(-2);
    const epsgCode = `${UTM_EPSG_CODE_BASES[hemisphere]}${paddedZone}`;
    previousValue[`EPSG:${epsgCode}`] = {
      id: `EPSG:${epsgCode}`,
      text: `UTM ${zone}${hemisphere} (EPSG:${epsgCode})`,
      url: `http://www.opengis.net/def/crs/EPSG/0/${epsgCode}`,
      projection: `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`,
    };

    return previousValue;
  }, {});
};
