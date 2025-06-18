import { hasDuplicateObjects } from './index';
import L from 'leaflet';
import { coordEach } from '@turf/meta';

export function splitPolygonOnAntimeridian(ring) {
  const westPolygon = [];
  const eastPolygon = [];
  let lastPointWasOverAntimeridian;

  ring.forEach((point, index) => {
    let [lng, lat] = point;
    const isOverAntimeridian = lng > 180 || lng < -180;

    if (isOverAntimeridian) {
      lng = lng > 180 ? -360 + lng : 360 + lng;
    }

    if (
      (lastPointWasOverAntimeridian === false && isOverAntimeridian) ||
      (lastPointWasOverAntimeridian && !isOverAntimeridian)
    ) {
      const crossingPoint = findCrossingPoint(ring[index - 1], [lng, lat]);
      westPolygon.push(crossingPoint.west);
      eastPolygon.push(crossingPoint.east);
    }

    if (lng < 0) {
      westPolygon.push([lng, lat]);
    } else {
      eastPolygon.push([lng, lat]);
    }

    if (ring.length - 1 === index) {
      if (!hasDuplicateObjects(westPolygon) && westPolygon.length >= 1) {
        westPolygon.push(westPolygon[0]);
      }

      if (!hasDuplicateObjects(eastPolygon) && eastPolygon.length >= 1) {
        eastPolygon.push(eastPolygon[0]);
      }
    }

    lastPointWasOverAntimeridian = isOverAntimeridian;
  });

  return { westPolygon, eastPolygon };
}

function findCrossingPoint(lastPoint, currentPoint) {
  let [lastLng, lastLat] = lastPoint;
  let [lng, lat] = currentPoint;

  const crossingLng = lastLng < 0 ? -180 : 180;

  if (Math.abs(lng - lastLng) > 180) {
    if (lng < 0) {
      lng += 360;
    } else {
      lastLng += 360;
    }
  }

  const slope = (lat - lastLat) / (lng - lastLng);
  const crossingLat = lastLat + slope * (crossingLng - lastLng);

  return { east: [180, crossingLat], west: [-180, crossingLat] };
}

export function doCoordinatesCrossAntimeridian(geometry) {
  let hasPositive = false;
  let hasNegative = false;
  coordEach(geometry, (currentCoord) => {
    if (currentCoord[0] > 180) {
      hasPositive = true;
    }
    if (currentCoord[0] < -180) {
      hasNegative = true;
    }
  });
  return hasPositive && hasNegative;
}

export function normalizeLongitude(lng) {
  if (lng < -180) {
    return lng + 360;
  }
  if (lng > 180) {
    return lng - 360;
  }
  return lng;
}

export function unNormalizeLongitude(lng, toWest) {
  if (toWest && lng > 0) {
    return lng - 360;
  }
  if (!toWest && lng < 0) {
    return lng + 360;
  }
  return lng;
}

export function normalizeBoundingBox(bbox) {
  const minLat = bbox._southWest.lat;
  let minLng = bbox._southWest.lng;
  const maxLat = bbox._northEast.lat;
  let maxLng = bbox._northEast.lng;

  if (minLng > 180) {
    minLng -= 360;
  } else if (minLng < -180) {
    minLng += 360;
  }

  if (maxLng > 180) {
    maxLng -= 360;
  } else if (maxLng < -180) {
    maxLng += 360;
  }

  return L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng));
}

export function unNormalizeMultiPolygonCoordinates(
  coordinates,
  unNormalizeAllRingsToFaceEast = false,
  ignoreReversedMultiPolygons = false,
) {
  return coordinates.map((polygon) => {
    const ringsArray = [];

    polygon.forEach((ring) => {
      const originalCoordinates = [];
      const reverseCoordinates = [];

      const amountOfCoordinatesToWest = !unNormalizeAllRingsToFaceEast
        ? ring.filter((coordinate) => coordinate[0] < 0).length
        : 0;
      const amountOfCoordinatesToEast = !unNormalizeAllRingsToFaceEast
        ? ring.filter((coordinate) => coordinate[0] > 0).length
        : 0;

      ring.forEach((coordinate) => {
        const [longitude, latitude] = coordinate;
        const unNormalizedCoordinate = [
          unNormalizeLongitude(
            longitude,
            unNormalizeAllRingsToFaceEast ? false : amountOfCoordinatesToWest > amountOfCoordinatesToEast,
          ),
          latitude,
        ];
        originalCoordinates.push(unNormalizedCoordinate);

        if (!ignoreReversedMultiPolygons && !unNormalizeAllRingsToFaceEast) {
          const invertedCoordinate = [
            unNormalizeLongitude(longitude, amountOfCoordinatesToWest < amountOfCoordinatesToEast),
            latitude,
          ];
          reverseCoordinates.push([...invertedCoordinate]);
        }
      });

      if (!ignoreReversedMultiPolygons && !unNormalizeAllRingsToFaceEast) {
        ringsArray.push(originalCoordinates, reverseCoordinates);
      } else {
        ringsArray.push(originalCoordinates);
      }
    });

    return ringsArray;
  });
}

export function multiPolygonCoordinatesNormalization(coordinates) {
  return coordinates.map((polygon) => {
    const ringsArray = [];

    polygon.forEach((ring) => {
      const originalCoordinates = [];

      ring.forEach((coordinate) => {
        const [longitude, latitude] = coordinate;
        originalCoordinates.push([normalizeLongitude(longitude), latitude]);
      });

      ringsArray.push(originalCoordinates);
    });

    return ringsArray;
  });
}

export function polygonCoordinatesNormalization(coordinates) {
  return coordinates.map((ring) => {
    const originalCoordinates = [];

    ring.forEach((coordinate) => {
      const [longitude, latitude] = coordinate;
      originalCoordinates.push([normalizeLongitude(longitude), latitude]);
    });

    return originalCoordinates;
  });
}

export function arePrevResultsAlreadyInTheList(prevSearchResults, searchResults) {
  return prevSearchResults?.every((prevResult) =>
    searchResults?.find((result) => result.id === prevResult.id),
  );
}

export function manipulateODataSearchResultsWithAntimeridianDuplicates(prevSearchResults, searchResult) {
  if (!searchResult) {
    return null;
  }

  let prevAllResultsFromOdataSearchResults = undefined;

  if (arePrevResultsAlreadyInTheList(prevSearchResults, searchResult)) {
    if (prevSearchResults.length < searchResult.length) {
      // removes already processed data out of searchResults array
      prevAllResultsFromOdataSearchResults = [...searchResult].splice(0, prevSearchResults.length);
    } else {
      return searchResult;
    }
  }

  const updatedSearchResults = searchResult.map((data) => {
    let dataCopy = { ...data };
    dataCopy.geometry = { ...data.geometry };
    //Checks for coordinates that are crossing antimeridian
    if (dataCopy.geometry?.type === 'MultiPolygon' && doCoordinatesCrossAntimeridian(dataCopy.geometry)) {
      dataCopy.geometry.coordinates = unNormalizeMultiPolygonCoordinates(dataCopy.geometry.coordinates);
    }
    return dataCopy;
  });

  // combines new array with old results
  if (prevAllResultsFromOdataSearchResults?.length > 0) {
    updatedSearchResults.unshift(...prevAllResultsFromOdataSearchResults);
  }

  return updatedSearchResults;
}
