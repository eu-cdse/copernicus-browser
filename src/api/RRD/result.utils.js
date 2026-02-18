import booleanValid from '@turf/boolean-valid';

export const extractFeaturesFromRRDResponse = (response) => {
  if (Array.isArray(response)) {
    const features = response.flatMap((tempResponse) => tempResponse.features || []);
    return features;
  }

  const features = response.features || [];
  return features;
};

export const ensureInternalFeatureIds = (features) => {
  return features.map((item) => ({
    ...item,
    _internalId: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
  }));
};

export const validateResultsGeometry = (features) => {
  if (!Array.isArray(features)) {
    return { valid: [], invalid: [] };
  }

  const isValidGeometry = (geometry) => {
    if (!geometry || typeof geometry !== 'object') {
      return false;
    }

    // booleanValid doesn't support GeometryCollection, just check basic structure
    if (geometry.type === 'GeometryCollection') {
      return (
        'geometries' in geometry &&
        Array.isArray(geometry.geometries) &&
        geometry.geometries.length > 0 &&
        geometry.geometries.every((g) => isValidGeometry(g))
      );
    }

    try {
      return booleanValid(geometry);
    } catch (err) {
      return false;
    }
  };

  return features.reduce(
    (acc, feature) => {
      const geometry = feature?.geometry;
      try {
        if (geometry && isValidGeometry(geometry)) {
          acc.valid.push(feature);
        } else {
          acc.invalid.push(feature);
        }
      } catch (err) {
        console.error('Failed to validate geometry', err, feature);
        acc.invalid.push(feature);
      }
      return acc;
    },
    { valid: [], invalid: [] },
  );
};

export const validateAndPrepareRRDResults = (response) => {
  const features = extractFeaturesFromRRDResponse(response);
  const { valid, invalid } = validateResultsGeometry(features);
  const withIds = ensureInternalFeatureIds(valid);

  return {
    validResults: withIds,
    invalidResults: invalid,
  };
};
