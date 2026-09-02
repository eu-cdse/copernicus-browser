jest.mock('../store', () => {
  const { floatingPanelNotificationSlice } = jest.requireActual(
    '../store/slices/floatingPanelNotificationSlice',
  );
  return {
    __esModule: true,
    default: { dispatch: jest.fn() },
    floatingPanelNotificationSlice,
  };
});

import store, { floatingPanelNotificationSlice } from '../store';
import { notifyAddedToCompare, notifyAddedToPins, notifyFloatingPanel } from './floatingPanelNotification';

const lastDispatchedAction = (callIndex = 0) => (store.dispatch as jest.Mock).mock.calls[callIndex][0];

describe('notifyFloatingPanel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('dispatches setFloatingPanelNotification with the given alert type and message', () => {
    notifyFloatingPanel('warning', 'Something needs attention');

    expect(store.dispatch).toHaveBeenCalledTimes(1);

    const dispatchedAction = lastDispatchedAction();
    expect(dispatchedAction.type).toBe(
      floatingPanelNotificationSlice.actions.setFloatingPanelNotification.type,
    );
    expect(dispatchedAction.payload.notificationAlertType).toBe('warning');
    expect(dispatchedAction.payload.notificationMsg).toBe('Something needs attention');
    expect(typeof dispatchedAction.payload.notificationUniqueId).toBe('string');
    expect(dispatchedAction.payload.notificationUniqueId.length).toBeGreaterThan(0);
  });

  test('two successive calls produce different notificationUniqueId values so the toast re-triggers', () => {
    notifyFloatingPanel('success', 'Done');
    notifyFloatingPanel('success', 'Done');

    expect(lastDispatchedAction(0).payload.notificationUniqueId).not.toBe(
      lastDispatchedAction(1).payload.notificationUniqueId,
    );
  });
});

describe.each([
  ['notifyAddedToCompare', notifyAddedToCompare],
  ['notifyAddedToPins', notifyAddedToPins],
])('%s', (_name, notify) => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('dispatches setFloatingPanelNotification with a success alert and a non-empty message and id', () => {
    notify();

    expect(store.dispatch).toHaveBeenCalledTimes(1);

    const dispatchedAction = lastDispatchedAction();
    expect(dispatchedAction.type).toBe(
      floatingPanelNotificationSlice.actions.setFloatingPanelNotification.type,
    );
    expect(dispatchedAction.payload.notificationAlertType).toBe('success');
    expect(typeof dispatchedAction.payload.notificationMsg).toBe('string');
    expect(dispatchedAction.payload.notificationMsg.length).toBeGreaterThan(0);
    expect(typeof dispatchedAction.payload.notificationUniqueId).toBe('string');
    expect(dispatchedAction.payload.notificationUniqueId.length).toBeGreaterThan(0);
  });

  test('two successive calls produce different notificationUniqueId values so the toast re-triggers', () => {
    notify();
    notify();

    expect(lastDispatchedAction(0).payload.notificationUniqueId).not.toBe(
      lastDispatchedAction(1).payload.notificationUniqueId,
    );
  });
});

test('the Compare and Pins messages are distinct', () => {
  jest.clearAllMocks();
  notifyAddedToCompare();
  notifyAddedToPins();

  expect(lastDispatchedAction(0).payload.notificationMsg).not.toBe(
    lastDispatchedAction(1).payload.notificationMsg,
  );
});
