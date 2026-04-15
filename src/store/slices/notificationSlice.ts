import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'error' | 'warning' | 'info';

export interface PanelError {
  message: string;
  link?: string | null;
  canBeClosed?: boolean;
  logout?: boolean;
}

interface NotificationState {
  type: NotificationType | null;
  msg: string | null;
  panelError: PanelError | null;
}

const initialState: NotificationState = {
  type: null,
  msg: null,
  panelError: null,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    displayPanelError: (state, action: PayloadAction<PanelError | null>) => {
      state.panelError = action.payload;
    },
    displayError: (state, action: PayloadAction<string>) => {
      state.type = 'error';
      state.msg = action.payload;
    },
    displayWarning: (state, action: PayloadAction<string>) => {
      state.type = 'warning';
      state.msg = action.payload;
    },
    displayInfo: (state, action: PayloadAction<string>) => {
      state.type = 'info';
      state.msg = action.payload;
    },
    removeNotification: (state) => {
      state.type = null;
      state.msg = null;
    },
    reset: (state) => {
      state.type = null;
      state.msg = null;
      state.panelError = null;
    },
  },
});
