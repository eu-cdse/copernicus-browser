import { resolveLegendForLayer } from './legendUtils';

const PREDEFINED_LEGEND = { type: 'discrete', items: [] };

jest.mock('../../assets/layers_metadata', () => ({
  PREDEFINED_LAYERS_METADATA: [
    {
      match: [{ datasourceId: 'S2_L2A_CDAS', layerId: '1_TRUE_COLOR' }],
      legend: PREDEFINED_LEGEND,
    },
  ],
}));

describe('resolveLegendForLayer', () => {
  it('matches the curated legend for a predefined layer that also carries an evalscript', () => {
    // Sentinel Hub populates `evalscript` on predefined layers too (it implements them server-side
    // via evalscripts), so this must not be mistaken for a custom visualization.
    const layer = {
      layerId: '1_TRUE_COLOR',
      evalscript: '//VERSION=3\n...',
      legend: { type: 'fallback' },
    };

    const { legendDefinition } = resolveLegendForLayer(layer, 'S2_L2A_CDAS', 'DEFAULT-THEME', null);

    expect(legendDefinition).toBe(PREDEFINED_LEGEND);
  });

  it('does not match the curated legend for a genuinely custom visualization', () => {
    const layer = {
      layerId: '1_TRUE_COLOR',
      evalscript: '//VERSION=3\n...',
      isCustomVisualization: true,
      legend: { type: 'fallback' },
    };

    const { legendDefinition } = resolveLegendForLayer(layer, 'S2_L2A_CDAS', 'DEFAULT-THEME', null);

    expect(legendDefinition).toBe(layer.legend);
  });

  it('falls back to the layer legend when there is no matching predefined metadata', () => {
    const layer = { layerId: 'UNKNOWN_LAYER', legend: { type: 'fallback' } };

    const { legendDefinition } = resolveLegendForLayer(layer, 'S2_L2A_CDAS', 'DEFAULT-THEME', null);

    expect(legendDefinition).toBe(layer.legend);
  });
});
