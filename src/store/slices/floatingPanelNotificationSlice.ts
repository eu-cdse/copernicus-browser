import React from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FloatingPanelNotificationAlertType = 'success' | 'warning';

interface FloatingPanelNotificationState {
  notificationUniqueId: string | null;
  notificationAlertType: FloatingPanelNotificationAlertType | null;
  notificationMsg: React.ReactNode | null;
}

const initialState: FloatingPanelNotificationState = {
  notificationUniqueId: null,
  notificationAlertType: null,
  notificationMsg: null,
};

export const floatingPanelNotificationSlice = createSlice({
  name: 'floatingPanelNotification',
  initialState,
  reducers: {
    setFloatingPanelNotification: (state, action: PayloadAction<FloatingPanelNotificationState>) => {
      state.notificationUniqueId = action.payload.notificationUniqueId;
      state.notificationAlertType = action.payload.notificationAlertType;
      state.notificationMsg = action.payload.notificationMsg;
    },

    reset: (state) => {
      state.notificationUniqueId = null;
      state.notificationAlertType = null;
      state.notificationMsg = null;
    },
  },
});
