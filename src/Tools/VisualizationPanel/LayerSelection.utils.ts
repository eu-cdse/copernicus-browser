/**
 * Utility functions for LayerSelection component
 */

import { isOpenEoSupported, getProcessGraphString } from '../../api/openEO/openEOHelpers';
import { isVisualizationEffectsApplied } from '../../utils/effectsUtils';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';

interface Band {
  name: string;
  [key: string]: unknown;
}

interface Layer {
  evalscript?: string;
  [key: string]: unknown;
}

interface DataSourceHandler {
  getBands?: (datasetId: string) => Band[];
  generateEvalscript?: (bandNames: string[], datasetId: string, config?: unknown) => string;
  [key: string]: unknown;
}

/**
 * Get 3 band names for default RGB evalscript.
 * If the dataset has fewer than 3 bands, the bands are repeated to ensure 3 bands are returned.
 *
 * Examples:
 * - [B1, B2, B3] → [B1, B2, B3]
 * - [B1, B2] → [B1, B2, B1]
 * - [B1] → [B1, B1, B1]
 *
 * @param datasetId - The dataset identifier
 * @param datasourceHandler - The data source handler instance
 * @returns Array of 3 band names
 */
export const getDefaultBandNames = (
  datasetId: string,
  datasourceHandler: DataSourceHandler | null | undefined,
): string[] => {
  const bands = datasourceHandler?.getBands?.(datasetId) || [];
  return [...bands, ...bands, ...bands].slice(0, 3).map((band) => band.name);
};

/**
 * Generate a fallback evalscript for a layer.
 * First tries to use the layer's existing evalscript, then falls back to generating
 * a default RGB evalscript from the dataset's bands.
 *
 * @param layer - The layer object that may contain an evalscript
 * @param datasetId - The dataset identifier
 * @param datasourceHandler - The data source handler instance
 * @returns The evalscript string or null if unable to generate
 */
export const generateFallbackEvalscript = (
  layer: Layer | null | undefined,
  datasetId: string,
  datasourceHandler: DataSourceHandler | null | undefined,
): string | null => {
  if (layer?.evalscript) {
    return layer.evalscript;
  }

  if (!datasourceHandler?.generateEvalscript) {
    return null;
  }

  const bandNames = getDefaultBandNames(datasetId, datasourceHandler);
  return datasourceHandler.generateEvalscript(bandNames, datasetId);
};

/**
 * Calculate OpenEO support and process graph for a layer.
 *
 * @param layer - The layer object containing url and layerId
 * @param effects - The visualization effects to check if applied
 * @returns Object with supportsOpenEO boolean and processGraphValue string
 */
export const getLayerProcessingInfo = (
  layer: { url: string; layerId: string; [key: string]: unknown },
  effects: unknown,
): { supportsOpenEO: boolean; processGraphValue: string } => {
  const isEffectsApplied = isVisualizationEffectsApplied(effects);
  const supportsOpenEO = isOpenEoSupported(
    layer.url,
    layer.layerId,
    IMAGE_FORMATS.PNG,
    isEffectsApplied,
    false,
  );
  const processGraphValue = getProcessGraphString(layer.url, layer.layerId, supportsOpenEO);
  return { supportsOpenEO, processGraphValue };
};

/**
 * Validate an evalscript for JavaScript syntax errors.
 *
 * @param script - The evalscript string to validate
 * @returns Object with isValid boolean and optional error message
 */
export const validateEvalscript = (script: string): { isValid: boolean; error?: string } => {
  if (!script || script.trim() === '') {
    return { isValid: false, error: 'Evalscript cannot be empty' };
  }

  try {
    // Attempt to create a new function from the script to detect syntax errors
    /* eslint-disable no-new-func */
    new Function(script);
    return { isValid: true };
  } catch (e) {
    const errorMessage = e && (e as Error).message ? (e as Error).message : String(e);
    return { isValid: false, error: errorMessage };
  }
};

/**
 * Validate and normalize an OpenEO process graph.
 *
 * @param processGraph - The process graph (string or object) to validate
 * @returns Object with isValid boolean, normalized processGraphString, and optional error message
 */
export const validateProcessGraph = (
  processGraph: string | object | undefined,
): { isValid: boolean; processGraphString?: string; error?: string } => {
  if (!processGraph) {
    return { isValid: false, error: 'Process graph cannot be empty' };
  }

  try {
    let processGraphString: string;

    if (typeof processGraph === 'string') {
      // Validate JSON syntax by parsing
      JSON.parse(processGraph);
      processGraphString = processGraph;
    } else {
      // Convert object to string
      processGraphString = JSON.stringify(processGraph);
    }

    return { isValid: true, processGraphString };
  } catch (e) {
    const errorMessage = e && (e as Error).message ? (e as Error).message : String(e);
    return { isValid: false, error: errorMessage };
  }
};
