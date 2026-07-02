import type { Feature, Geometry } from 'geojson';
import { isValidGeometry } from '../../utils/geojson.utils';

export interface RRDFeature extends Feature {
  _internalId?: string;
}

type RRDResponseChunk = { features?: RRDFeature[]; [key: string]: unknown };
type RRDResponse = RRDResponseChunk | RRDResponseChunk[];

interface PartitionedResults {
  valid: RRDFeature[];
  invalid: RRDFeature[];
}

export const extractFeaturesFromRRDResponse = (response: RRDResponse): RRDFeature[] => {
  if (Array.isArray(response)) {
    return response.flatMap((tempResponse) => tempResponse.features || []);
  }

  return response.features || [];
};

export const ensureInternalFeatureIds = (features: RRDFeature[]): RRDFeature[] => {
  return features.map((item) => ({
    ...item,
    _internalId: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
  }));
};

export const validateResultsGeometry = (features: RRDFeature[]): PartitionedResults => {
  if (!Array.isArray(features)) {
    return { valid: [], invalid: [] };
  }

  return features.reduce<PartitionedResults>(
    (acc, feature) => {
      const geometry = feature?.geometry as Geometry | undefined;
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

export const validateAndPrepareRRDResults = (
  response: RRDResponse,
): { validResults: RRDFeature[]; invalidResults: RRDFeature[] } => {
  const features = extractFeaturesFromRRDResponse(response);
  const { valid, invalid } = validateResultsGeometry(features);
  const withIds = ensureInternalFeatureIds(valid);

  return {
    validResults: withIds,
    invalidResults: invalid,
  };
};
