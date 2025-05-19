import { AttributeNames, AttributesDescriptions } from './assets/attributes';

export const getTagsFromAttributes = (tile) => {
  const { platformShortName, attributes } = tile;

  // Default tags for all missions
  let tags = [
    AttributeNames.platformShortName,
    AttributeNames.instrumentShortName,
    AttributeNames.productType,
    AttributeNames.fileFormat,
  ];

  if (platformShortName === 'SENTINEL-1') {
    tags = [AttributeNames.polarisationChannels, AttributeNames.operationalMode];
  }

  return tags
    .map((tag) => {
      const attribute = attributes.find((attr) => attr.Name === tag);
      return attribute ? { value: attribute.Value, description: AttributesDescriptions[tag] } : null;
    })
    .filter((tag) => tag !== null);
};
