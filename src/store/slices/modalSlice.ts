import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalId } from '../../const';

type ModalIdValue = (typeof ModalId)[keyof typeof ModalId];

interface ModalState {
  id: ModalIdValue | null;
  params: Record<string, unknown> | null;
}

const initialState: ModalState = {
  id: null,
  params: null,
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    addModal: (state, action: PayloadAction<{ modal: ModalIdValue; params?: Record<string, unknown> }>) => {
      state.id = action.payload.modal;
      state.params = action.payload.params ?? null;
    },
    removeModal: () => initialState,
  },
});
