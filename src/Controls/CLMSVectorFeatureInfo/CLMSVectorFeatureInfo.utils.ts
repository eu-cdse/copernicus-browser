import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

export const GFI_IMAGE_SIZE = 512;

export type FeatureAttributes = Record<string, string | number | null | undefined>;

export async function fetchWmsGetFeatureInfo({
  datasetId,
  lat,
  lng,
}: {
  datasetId: string;
  lat: number;
  lng: number;
}): Promise<FeatureAttributes | null> {
  const dsh = getDataSourceHandler(datasetId);
  if (!dsh || typeof dsh.buildGetFeatureInfoUrl !== 'function') {
    return null;
  }
  const url = dsh.buildGetFeatureInfoUrl(datasetId, lat, lng);
  const response = await axios.get<string>(url);
  return parseGmlResponse(response.data);
}

export function parseGmlResponse(gmlText: string): FeatureAttributes | null {
  const parser = new XMLParser({ parseTagValue: false });
  const parsed = parser.parse(gmlText);
  const msGML = parsed?.msGMLOutput;
  if (!msGML) {
    return null;
  }
  const layerKey = Object.keys(msGML).find((k: string) => k.endsWith('_layer'));
  if (!layerKey) {
    return null;
  }
  const layerData = msGML[layerKey];
  const featureKey = Object.keys(layerData).find((k: string) => k.endsWith('_feature'));
  if (!featureKey) {
    return null;
  }
  // XMLParser returns an array when multiple features share the same key; take the first
  const rawFeature = layerData[featureKey];
  const feature = Array.isArray(rawFeature) ? rawFeature[0] : rawFeature;
  if (!feature) {
    return null;
  }
  const { 'gml:boundedBy': _boundedBy, 'gml:name': _name, ...attributes } = feature;
  return attributes as FeatureAttributes;
}
