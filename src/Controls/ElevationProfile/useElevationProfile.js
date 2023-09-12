import { useEffect, useState } from 'react';
import { t } from 'ttag';
import turfDistance from '@turf/distance';
import turfLength from '@turf/length';
import { reprojectGeometry, reprojectCoordPoint } from '../../utils/reproject';

const DEFAULT_SEGMENT_LENGTH = 100; //meters

const reprojectElevationData = (data) =>
  data.map((line, i) => ({
    title: `Line ${i}`,
    coordinates: line.map((coord) => {
      const point = reprojectCoordPoint([coord[0], coord[1]], 'EPSG:3857', 'EPSG:4326');
      return {
        lng: point[0],
        lat: point[1],
        elevation: coord[2],
      };
    }),
  }));

const calculateMetadata = (data) =>
  data.map((line) => {
    const coordinates = line.coordinates;
    let minElevation = Number.POSITIVE_INFINITY;
    let maxElevation = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < coordinates.length; i++) {
      if (coordinates[i].elevation < minElevation) {
        minElevation = coordinates[i].elevation;
      }

      if (coordinates[i].elevation > maxElevation) {
        maxElevation = coordinates[i].elevation;
      }

      if (i === 0) {
        coordinates[i].distance = 0;
        coordinates[i].slope = 0;
      } else {
        const distance = turfDistance(
          {
            type: 'Point',
            coordinates: [coordinates[i - 1].lng, coordinates[i - 1].lat],
          },
          {
            type: 'Point',
            coordinates: [coordinates[i].lng, coordinates[i].lat],
          },
          { units: 'meters' },
        );
        coordinates[i].distance = coordinates[i - 1].distance + distance;
        coordinates[i].slope = ((coordinates[i].elevation - coordinates[i - 1].elevation) / distance) * 100;
      }
    }
    line.minElevation = minElevation;
    line.maxElevation = maxElevation;
    return line;
  });

const formatInputGeometry = (geometry) => {
  const reprojectedGeometry = reprojectGeometry(geometry, {
    fromCrs: 'EPSG:4326',
    toCrs: 'EPSG:3857',
  });

  let inputCoordinates = [];
  if (geometry.type === 'LineString') {
    inputCoordinates = [reprojectedGeometry.coordinates.flat()];
  } else if (geometry.type === 'MultiLineString') {
    inputCoordinates = reprojectedGeometry.coordinates.map((l) => l.coordinates.flat());
  }
  return inputCoordinates;
};

const formatResult = (data) => {
  const resultWithoutNaNValues = data.map((line) => line.map(([x, y, z]) => [x, y, isNaN(z) ? 0 : z]));
  const reprojectedData = reprojectElevationData(resultWithoutNaNValues);
  const result = calculateMetadata(reprojectedData);

  return result;
};

// in case of missing dem tiles, result may contain some segments with NaN values
// result is valid if it contains at least one line with some elevation data
const checkResult = (result) => {
  if (!result) {
    return false;
  }

  return (
    result
      .flat()
      .map(([, , z]) => !isNaN(z))
      .filter((val) => val).length > 0
  );
};

export const useElevationProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [data, setData] = useState(null);
  const [params, setParams] = useState({});

  const computeElevationProfileCallback = (result, errorMessages = []) => {
    const isValidResult = checkResult(result);

    try {
      if (errorMessages?.length && !isValidResult) {
        console.error(errorMessages);
        return setError(t`Unable to get elevation data`);
      }

      if (result) {
        setData(formatResult(result));
      }
    } catch (e) {
      console.error(e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getElevationData = async ({ provider, geometry, zoom }) => {
      setLoading(true);
      setData(null);
      setError(null);

      try {
        let inputCoordinates = formatInputGeometry(geometry);

        const length = turfLength(geometry, { units: 'meters' });
        let segmentLength = DEFAULT_SEGMENT_LENGTH;
        if (length / DEFAULT_SEGMENT_LENGTH < 10) {
          segmentLength = Math.max(Math.round(length / DEFAULT_SEGMENT_LENGTH), 10);
        }

        window.computeElevationProfile(
          provider,
          inputCoordinates,
          zoom,
          segmentLength,
          computeElevationProfileCallback,
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (params?.geometry) {
      getElevationData(params);
    }
  }, [params]);

  return [{ loading, error, data }, setParams];
};
