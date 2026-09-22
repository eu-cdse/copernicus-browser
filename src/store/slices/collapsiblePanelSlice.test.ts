import { collapsiblePanelSlice } from './collapsiblePanelSlice';
import { panelSlice } from './panelSlice';

const { setCollectionPanelExpanded } = collapsiblePanelSlice.actions;
const { openPanel, closePanel } = panelSlice.actions;

describe('collapsiblePanelSlice reducer', () => {
  describe('reacting to panelSlice.openPanel', () => {
    it.each(['layers', 'wms'] as const)(
      'force-expands the data collections view when opening %s',
      (panel) => {
        const state = collapsiblePanelSlice.reducer(
          collapsiblePanelSlice.reducer(
            collapsiblePanelSlice.getInitialState(),
            setCollectionPanelExpanded(false),
          ),
          openPanel(panel),
        );
        expect(state.collectionPanelExpanded).toBe(true);
      },
    );

    it.each(['highlights', 'pins', 'compare'] as const)(
      'force-collapses the data collections view when opening %s, regardless of a manual expand',
      (panel) => {
        const state = collapsiblePanelSlice.reducer(
          collapsiblePanelSlice.reducer(
            collapsiblePanelSlice.getInitialState(),
            setCollectionPanelExpanded(true),
          ),
          openPanel(panel),
        );
        expect(state.collectionPanelExpanded).toBe(false);
      },
    );

    it.each(['highlights', 'pins', 'compare'] as const)(
      'collapses the data collections view when opening %s from the initial state (URL-restore on load)',
      (panel) => {
        const state = collapsiblePanelSlice.reducer(
          collapsiblePanelSlice.getInitialState(),
          openPanel(panel),
        );
        expect(state.collectionPanelExpanded).toBe(false);
      },
    );

    it('force-expands the data collections view when opening wms from pins (PinPanel WMS-pin entry point)', () => {
      let state = collapsiblePanelSlice.reducer(
        collapsiblePanelSlice.getInitialState(),
        setCollectionPanelExpanded(false),
      );
      state = collapsiblePanelSlice.reducer(state, openPanel('pins'));
      state = collapsiblePanelSlice.reducer(state, openPanel('wms'));
      expect(state.collectionPanelExpanded).toBe(true);
    });

    it.each([
      ['highlights', 'pins'],
      ['pins', 'compare'],
      ['compare', 'highlights'],
    ] as const)(
      'collapses a manually-expanded data collections view when hopping from %s to %s',
      (from, to) => {
        let state = collapsiblePanelSlice.reducer(collapsiblePanelSlice.getInitialState(), openPanel(from));
        state = collapsiblePanelSlice.reducer(state, setCollectionPanelExpanded(true));
        state = collapsiblePanelSlice.reducer(state, openPanel(to));
        expect(state.collectionPanelExpanded).toBe(false);
      },
    );
  });

  describe('reacting to panelSlice.closePanel', () => {
    it('does not affect the data collections view — only openPanel drives it', () => {
      let state = collapsiblePanelSlice.reducer(collapsiblePanelSlice.getInitialState(), openPanel('wms'));
      state = collapsiblePanelSlice.reducer(state, closePanel('wms'));
      expect(state.collectionPanelExpanded).toBe(true);
    });
  });
});
