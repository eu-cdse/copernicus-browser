import {
  ADDITIONAL_FILTERS_EDGE_GAP,
  ADDITIONAL_FILTERS_MIN_TOP,
  getAdditionalFiltersPanelStyle,
} from './additionalFiltersPanelPosition';

describe('getAdditionalFiltersPanelStyle', () => {
  it('exposes the expected constants', () => {
    expect(ADDITIONAL_FILTERS_MIN_TOP).toBe(120);
    expect(ADDITIONAL_FILTERS_EDGE_GAP).toBe(8);
  });

  it('anchors to the toggle when the panel fits', () => {
    expect(getAdditionalFiltersPanelStyle({ anchorTop: 300, panelHeight: 200, bottomLimit: 800 })).toEqual({
      top: '300px',
    });
  });

  it('clamps an anchor above the minimum top to the minimum top', () => {
    expect(getAdditionalFiltersPanelStyle({ anchorTop: 50, panelHeight: 200, bottomLimit: 800 })).toEqual({
      top: '120px',
    });
  });

  it('treats a panel ending exactly on the bottom limit as fitting', () => {
    expect(getAdditionalFiltersPanelStyle({ anchorTop: 300, panelHeight: 500, bottomLimit: 800 })).toEqual({
      top: '300px',
    });
  });

  it('moves the panel up so its bottom edge sits on the bottom limit when it does not fit', () => {
    const style = getAdditionalFiltersPanelStyle({ anchorTop: 600, panelHeight: 400, bottomLimit: 800 });
    expect(parseInt(style.top, 10) + 400).toBe(800);
    expect(style.maxHeight).toBe('400px');
  });

  it('caps the height when the panel is taller than the available space', () => {
    const style = getAdditionalFiltersPanelStyle({ anchorTop: 300, panelHeight: 2000, bottomLimit: 800 });
    expect(style.top).toBe(`${ADDITIONAL_FILTERS_EDGE_GAP}px`);
    expect(style.maxHeight).toBe(`${800 - ADDITIONAL_FILTERS_EDGE_GAP}px`);
  });
});
