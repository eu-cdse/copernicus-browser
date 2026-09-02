import { pinsSlice, PinsState } from './pinsSlice';
import { UNSAVED_PINS, SAVED_PINS } from '../../Tools/Pins/const';

const { updateItems, updatePinsByType, clearByType, removeItem, reset } = pinsSlice.actions;

const getInitialState = (): PinsState => ({
  items: [],
});

describe('pinsSlice reducer', () => {
  describe('updatePinsByType', () => {
    test('replaces only pins of the given type, preserving pins of the other type', () => {
      let state = getInitialState();
      state = pinsSlice.reducer(
        state,
        updatePinsByType({ pins: [{ id: 'u1' }, { id: 'u2' }], pinType: UNSAVED_PINS }),
      );
      state = pinsSlice.reducer(state, updatePinsByType({ pins: [{ id: 's1' }], pinType: SAVED_PINS }));

      state = pinsSlice.reducer(
        state,
        updatePinsByType({
          pins: [{ id: 's2' }, { id: 's3' }, { id: 's4' }],
          pinType: SAVED_PINS,
        }),
      );

      expect(state.items).toHaveLength(5);
      expect(state.items.filter((item) => item.type === UNSAVED_PINS)).toHaveLength(2);
      expect(state.items.filter((item) => item.type === SAVED_PINS)).toHaveLength(3);
    });

    test('created items have opacity 1.0, clipping [0, 1] and the correct type', () => {
      const state = pinsSlice.reducer(
        getInitialState(),
        updatePinsByType({ pins: [{ id: 's1' }], pinType: SAVED_PINS }),
      );

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toMatchObject({
        type: SAVED_PINS,
        item: { id: 's1' },
        opacity: 1.0,
        clipping: [0, 1],
      });
    });
  });

  describe('updateItems', () => {
    test('replaces the whole items array wholesale', () => {
      let state = pinsSlice.reducer(
        getInitialState(),
        updatePinsByType({ pins: [{ id: 'u1' }], pinType: UNSAVED_PINS }),
      );

      const newItems = [
        { type: SAVED_PINS, item: { id: 's1' }, opacity: 1.0, clipping: [0, 1] as [number, number] },
      ];
      state = pinsSlice.reducer(state, updateItems(newItems));

      expect(state.items).toEqual(newItems);
    });
  });

  describe('clearByType', () => {
    test('removes only the given type, leaves the other', () => {
      let state = pinsSlice.reducer(
        getInitialState(),
        updatePinsByType({ pins: [{ id: 'u1' }, { id: 'u2' }], pinType: UNSAVED_PINS }),
      );
      state = pinsSlice.reducer(state, updatePinsByType({ pins: [{ id: 's1' }], pinType: SAVED_PINS }));

      state = pinsSlice.reducer(state, clearByType(UNSAVED_PINS));

      expect(state.items).toHaveLength(1);
      expect(state.items[0].type).toBe(SAVED_PINS);
    });
  });

  describe('removeItem', () => {
    test('removes the item at the given index', () => {
      let state = pinsSlice.reducer(
        getInitialState(),
        updatePinsByType({ pins: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }], pinType: UNSAVED_PINS }),
      );

      state = pinsSlice.reducer(state, removeItem(1));

      expect(state.items).toHaveLength(2);
      expect(state.items.map((item) => item.item.id)).toEqual(['u1', 'u3']);
    });
  });

  describe('reset', () => {
    test('empties items', () => {
      let state = pinsSlice.reducer(
        getInitialState(),
        updatePinsByType({ pins: [{ id: 'u1' }], pinType: UNSAVED_PINS }),
      );

      state = pinsSlice.reducer(state, reset());

      expect(state.items).toEqual([]);
    });
  });

  test('items.length reflects the correct count after a load/remove sequence (Pins tab badge regression guard, #1165)', () => {
    let state = getInitialState();

    // load 2 local (unsaved) pins at startup
    state = pinsSlice.reducer(
      state,
      updatePinsByType({ pins: [{ id: 'u1' }, { id: 'u2' }], pinType: UNSAVED_PINS }),
    );
    expect(state.items.length).toBe(2);

    // load 3 backend (saved) pins
    state = pinsSlice.reducer(
      state,
      updatePinsByType({
        pins: [{ id: 's1' }, { id: 's2' }, { id: 's3' }],
        pinType: SAVED_PINS,
      }),
    );
    expect(state.items.length).toBe(5);

    // remove one
    state = pinsSlice.reducer(state, removeItem(0));
    expect(state.items.length).toBe(4);
  });
});
