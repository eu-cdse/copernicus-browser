import { PREDEFINED_LAYERS_METADATA } from '../../assets/layers_metadata';

/*
returns legend definition from layers_metadata.json for provided datasource and layer.
*/
export function findMatchingLayerMetadata(datasourceId, layerId, themeId, time) {
  const layerMetadata = PREDEFINED_LAYERS_METADATA.find(
    (l) =>
      !!l.match.find(
        (m) =>
          m.datasourceId === datasourceId &&
          m.layerId === layerId &&
          (m.theme ? m.theme === themeId : true) &&
          (time && m.timeTo ? time <= m.timeTo : true) &&
          (time && m.timeFrom ? time >= m.timeFrom : true),
      ),
  );
  return layerMetadata;
}

export function getDescriptionFromMetadata(metadata) {
  return metadata && metadata.description ? metadata.description() : null;
}

export function getTitleFromMetadata(metadata, selectedModeId) {
  if (!metadata || !metadata.titles) {
    return null;
  }
  const titles = metadata.titles();
  return titles[selectedModeId] ? titles[selectedModeId] : null;
}

export function getShortDescriptionFromMetadata(metadata, selectedModeId) {
  if (!metadata || !metadata.shortDescriptions) {
    return null;
  }
  const shortDescriptions = metadata.shortDescriptions();
  return shortDescriptions[selectedModeId] ? shortDescriptions[selectedModeId] : null;
}

export function getLegendDefinitionFromMetadata(metadata) {
  return metadata ? metadata.legend : null;
}

/*
returns min and max position for continuous legend
*/

export function getMinMaxPosition(legend) {
  let minPosition = legend.minPosition || 0.0;
  let maxPosition = legend.maxPosition || 1.0;
  legend.gradients.forEach((el) => {
    minPosition = Math.min(minPosition, el.position);
    maxPosition = Math.max(maxPosition, el.position);
  });
  return {
    minPosition,
    maxPosition,
  };
}

export function createGradients(legend) {
  const { minPosition, maxPosition } = getMinMaxPosition(legend);
  let gradients = [];
  const rules = legend.gradients
    .filter((g) => g.color)
    .map((r) => ({
      ...r,
      relPosition: (r.position - minPosition) / (maxPosition - minPosition),
    }));

  // fill the remaining space at start:
  if (rules[0].relPosition > 0.0) {
    gradients.push({
      startColor: rules[0].color,
      endColor: rules[0].color,
      pos: 0.0,
      size: rules[0].relPosition,
    });
  }
  for (let i = 0; i < rules.length - 1; i++) {
    gradients.push({
      startColor: rules[i].color,
      endColor: rules[i + 1].color,
      pos: rules[i].relPosition,
      size: rules[i + 1].relPosition - rules[i].relPosition,
    });
  }
  // fill the remaining space:
  if (rules[rules.length - 1].relPosition < 1.0) {
    gradients.push({
      startColor: rules[rules.length - 1].color,
      endColor: rules[rules.length - 1].color,
      pos: rules[rules.length - 1].relPosition,
      size: 1.0 - rules[rules.length - 1].relPosition,
    });
  }
  return {
    minPosition,
    maxPosition,
    gradients,
  };
}
