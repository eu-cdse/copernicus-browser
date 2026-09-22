import { panelSlice } from './panelSlice';

const { openPanel, closePanel } = panelSlice.actions;

describe('panelSlice reducer', () => {
  it('has layers open and everything else closed initially', () => {
    const state = panelSlice.getInitialState();
    expect(state).toEqual({
      layers: true,
      highlights: false,
      pins: false,
      wms: false,
      compare: false,
    });
  });

  describe('openPanel', () => {
    it('opening wms closes layers, highlights, pins and compare', () => {
      const state = panelSlice.reducer(panelSlice.getInitialState(), openPanel('wms'));
      expect(state).toEqual({
        layers: false,
        highlights: false,
        pins: false,
        wms: true,
        compare: false,
      });
    });

    it('opening layers after wms was open closes wms', () => {
      let state = panelSlice.reducer(panelSlice.getInitialState(), openPanel('wms'));
      state = panelSlice.reducer(state, openPanel('layers'));
      expect(state).toEqual({
        layers: true,
        highlights: false,
        pins: false,
        wms: false,
        compare: false,
      });
    });

    it('opening compare closes all the other panels', () => {
      const state = panelSlice.reducer(panelSlice.getInitialState(), openPanel('compare'));
      expect(state).toEqual({
        layers: false,
        highlights: false,
        pins: false,
        wms: false,
        compare: true,
      });
    });

    it('re-opening the already-open panel is a no-op', () => {
      const state = panelSlice.reducer(panelSlice.getInitialState(), openPanel('layers'));
      expect(state).toEqual(panelSlice.getInitialState());
    });
  });

  describe('closePanel', () => {
    it('clears only the given key, leaving the others untouched', () => {
      let state = panelSlice.reducer(panelSlice.getInitialState(), openPanel('wms'));
      state = panelSlice.reducer(state, closePanel('wms'));
      expect(state).toEqual({
        layers: false,
        highlights: false,
        pins: false,
        wms: false,
        compare: false,
      });
    });

    it('closing a panel that is already closed does not affect other panels', () => {
      const state = panelSlice.reducer(panelSlice.getInitialState(), closePanel('wms'));
      expect(state).toEqual(panelSlice.getInitialState());
    });
  });
});
