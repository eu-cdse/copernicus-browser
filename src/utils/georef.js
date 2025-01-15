import bboxPolygon from '@turf/bbox-polygon';

// omitting I up to M
const LATIDUDE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
// omitting I and O
const LONGITUDE_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];
// omitting I and O up to Q
const DEGREE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q'];

const QUADS = {
  '15DEGREE': '15DEGREE',
  '1DEGREE': '1DEGREE',
  '1MINUTE': '1MINUTE',
  '10thMINUTE': '10thMINUTE',
  '100thMINUTE': '100thMINUTE',
};

const QUAD_DEGREE_SIZES = {
  [QUADS['15DEGREE']]: 15,
  [QUADS['1DEGREE']]: 1,
  // We use decimals in our calculations, 60 minutes in a degree.
  [QUADS['1MINUTE']]: 1 / 60,
  [QUADS['10thMINUTE']]: 0.1 / 60,
  [QUADS['100thMINUTE']]: 0.01 / 60,
};

/**
 * Decodes GeoRef id string to quads. Used to calculate how many degrees or minutes should be offset from minX and minY
 * set.
 *
 */
function decode(gridId) {
  if (gridId.length < 2) {
    throw new Error('georef id should be atleast 2 characters long');
  }
  if (gridId.length % 2 !== 0) {
    throw new Error('georef id should have even amount of characters');
  }
  const minuteHunk = gridId.slice(4);
  const eastingHunk = minuteHunk.slice(0, minuteHunk.length / 2);
  const northingHunk = minuteHunk.slice(minuteHunk.length / 2, minuteHunk.length);

  // GeoRef string GJPJ34241716 can broken up in to sections
  // GJ is 15 degree column and rows from -180 and -90
  // PJ 1 degree from north and east from GJ cell
  // 34241716 is broken in to 34 and 17 minutes east and north, 24 and 16 is 24/100 and 16/100
  // See https://en.wikipedia.org/wiki/World_Geographic_Reference_System for more info
  const quads = {
    [QUADS['15DEGREE']]: {
      lng: LONGITUDE_LETTERS.indexOf(gridId[0].toUpperCase()),
      lat: LATIDUDE_LETTERS.indexOf(gridId[1].toUpperCase()),
    },
    [QUADS['1DEGREE']]: {
      lng: gridId[2] === undefined ? null : DEGREE_LETTERS.indexOf(gridId[2].toUpperCase()),
      lat: gridId[3] === undefined ? null : DEGREE_LETTERS.indexOf(gridId[3].toUpperCase()),
    },
    [QUADS['1MINUTE']]: {
      lng: minuteHunk.length >= 4 ? Number(eastingHunk.slice(0, 2)) : null,
      lat: minuteHunk.length >= 4 ? Number(northingHunk.slice(0, 2)) : null,
    },
    [QUADS['10thMINUTE']]: {
      lng: minuteHunk.length === 6 ? Number(eastingHunk.slice(2)) : null,
      lat: minuteHunk.length === 6 ? Number(northingHunk.slice(2)) : null,
    },
    [QUADS['100thMINUTE']]: {
      lng: minuteHunk.length === 8 ? Number(eastingHunk.slice(2)) : null,
      lat: minuteHunk.length === 8 ? Number(northingHunk.slice(2)) : null,
    },
  };
  return quads;
}

function getSmallestQuad(quads) {
  const nonNull = Object.keys(quads).filter(
    (quadKey) => quads[quadKey].lng !== null && quads[quadKey].lat !== null,
  );
  const allOffsets = nonNull.map((key) => QUAD_DEGREE_SIZES[key]);
  const smallest = Math.min(...allOffsets);
  return smallest;
}

function createBounds(quads) {
  let minX = -180;
  let minY = -90;
  Object.keys(quads).forEach((quadKey) => {
    if (quads[quadKey].lng !== null && quads[quadKey].lat !== null) {
      minX = minX + quads[quadKey].lng * QUAD_DEGREE_SIZES[quadKey];
      minY = minY + quads[quadKey].lat * QUAD_DEGREE_SIZES[quadKey];
    }
  });
  const quadSize = getSmallestQuad(quads);
  return [minX, minY, minX + quadSize, minY + quadSize];
}

export function getGeoRefBounds(gridId) {
  const decodedGeoRef = decode(gridId);
  const polygon = bboxPolygon(createBounds(decodedGeoRef));
  return polygon;
}
