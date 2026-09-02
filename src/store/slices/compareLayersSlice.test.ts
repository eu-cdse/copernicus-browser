import { compareLayersSlice, CompareLayersState } from './compareLayersSlice';
import { COMPARE_OPTIONS } from '../../const';

const { addToCompare, removeFromCompare, resetComparedLayers } = compareLayersSlice.actions;

const getInitialState = (): CompareLayersState => ({
  compareShare: null,
  compareSharedPinsId: null,
  compareMode: COMPARE_OPTIONS.COMPARE_SPLIT,
  comparedLayers: [],
  comparedOpacity: [],
  comparedClipping: [],
});

describe('compareLayersSlice reducer', () => {
  describe('addToCompare', () => {
    test('prepends the new layer and assigns it a generated id', () => {
      const state = compareLayersSlice.reducer(getInitialState(), addToCompare({ layerId: 'TRUE_COLOR' }));

      expect(state.comparedLayers).toHaveLength(1);
      expect(state.comparedLayers[0]).toMatchObject({ layerId: 'TRUE_COLOR' });
      expect(typeof state.comparedLayers[0].id).toBe('string');
      expect(state.comparedLayers[0].id.length).toBeGreaterThan(0);
    });

    test('prepends 1.0 to comparedOpacity and [0, 1] to comparedClipping', () => {
      const state = compareLayersSlice.reducer(getInitialState(), addToCompare({ layerId: 'TRUE_COLOR' }));

      expect(state.comparedOpacity).toEqual([1.0]);
      expect(state.comparedClipping).toEqual([[0, 1]]);
    });

    test('adding a second layer puts it at index 0 (newest first) and keeps arrays in sync', () => {
      let state = compareLayersSlice.reducer(getInitialState(), addToCompare({ layerId: 'FIRST' }));
      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'SECOND' }));

      expect(state.comparedLayers).toHaveLength(2);
      expect(state.comparedLayers[0]).toMatchObject({ layerId: 'SECOND' });
      expect(state.comparedLayers[1]).toMatchObject({ layerId: 'FIRST' });

      expect(state.comparedOpacity).toEqual([1.0, 1.0]);
      expect(state.comparedClipping).toEqual([
        [0, 1],
        [0, 1],
      ]);

      expect(state.comparedLayers.length).toBe(state.comparedOpacity.length);
      expect(state.comparedLayers.length).toBe(state.comparedClipping.length);
    });

    test('each added layer gets a unique id', () => {
      let state = compareLayersSlice.reducer(getInitialState(), addToCompare({ layerId: 'FIRST' }));
      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'SECOND' }));

      expect(state.comparedLayers[0].id).not.toBe(state.comparedLayers[1].id);
    });
  });

  describe('removeFromCompare', () => {
    test('removes the entry at the given index from all three arrays, keeping them in sync', () => {
      let state = compareLayersSlice.reducer(getInitialState(), addToCompare({ layerId: 'FIRST' }));
      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'SECOND' }));
      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'THIRD' }));
      // state.comparedLayers is now [THIRD, SECOND, FIRST]

      state = compareLayersSlice.reducer(state, removeFromCompare(1));

      expect(state.comparedLayers).toHaveLength(2);
      expect(state.comparedLayers.map((l) => l.layerId)).toEqual(['THIRD', 'FIRST']);
      expect(state.comparedOpacity).toHaveLength(2);
      expect(state.comparedClipping).toHaveLength(2);
    });

    test('comparedLayers.length reflects the correct count after an add/remove sequence (Compare tab badge regression guard, #1164)', () => {
      let state = getInitialState();
      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'FIRST' }));
      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'SECOND' }));
      expect(state.comparedLayers.length).toBe(2);

      state = compareLayersSlice.reducer(state, removeFromCompare(0));
      expect(state.comparedLayers.length).toBe(1);

      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'THIRD' }));
      expect(state.comparedLayers.length).toBe(2);

      state = compareLayersSlice.reducer(state, removeFromCompare(1));
      expect(state.comparedLayers.length).toBe(1);
      expect(state.comparedOpacity.length).toBe(1);
      expect(state.comparedClipping.length).toBe(1);
    });
  });

  describe('resetComparedLayers', () => {
    test('empties comparedLayers, comparedOpacity and comparedClipping', () => {
      let state = compareLayersSlice.reducer(getInitialState(), addToCompare({ layerId: 'FIRST' }));
      state = compareLayersSlice.reducer(state, addToCompare({ layerId: 'SECOND' }));

      state = compareLayersSlice.reducer(state, resetComparedLayers());

      expect(state.comparedLayers).toEqual([]);
      expect(state.comparedOpacity).toEqual([]);
      expect(state.comparedClipping).toEqual([]);
    });
  });
});
