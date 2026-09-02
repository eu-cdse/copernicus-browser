import React from 'react';
import { t } from 'ttag';
import { v4 as uuid } from 'uuid';

import store, { floatingPanelNotificationSlice } from '../store';
import { FloatingPanelNotificationAlertType } from '../store/slices/floatingPanelNotificationSlice';

// Single entry point for the floating panel toast, so the payload shape - and the fresh uuid that
// makes the panel re-trigger for a repeated message - lives in one place.
export function notifyFloatingPanel(
  alertType: FloatingPanelNotificationAlertType,
  msg: React.ReactNode,
): void {
  store.dispatch(
    floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
      notificationUniqueId: uuid(),
      notificationAlertType: alertType,
      notificationMsg: msg,
    }),
  );
}

// The `t` calls below stay inside the functions on purpose: hoisting them to module level would
// freeze the message to whichever language was active when this module was first imported.

// Shown from every "add to Compare" entry point (layer actions, pins, highlights) so the user gets
// the same confirmation they already get when adding a product to the Workspace.
export function notifyAddedToCompare(): void {
  notifyFloatingPanel('success', t`Successfully added to Compare`);
}

// Shown from every "add to Pins" entry point (layer actions, highlights) so the user gets the same
// confirmation they already get when adding a product to the Workspace or to Compare.
export function notifyAddedToPins(): void {
  notifyFloatingPanel('success', t`Successfully added to Pins`);
}
