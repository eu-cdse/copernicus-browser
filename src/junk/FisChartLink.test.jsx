import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import FisChartLink from './FisChartLink';
import store, { loginPromptSlice, authSlice } from '../store';

jest.mock('../icons/statistical_info.svg?react', () => ({
  __esModule: true,
  default: () => <svg />,
}));

const renderLink = (props) =>
  render(
    <Provider store={store}>
      <FisChartLink onErrorMessage={jest.fn()} openFisPopup={jest.fn()} {...props} />
    </Provider>,
  );

describe('FisChartLink', () => {
  beforeEach(() => {
    store.dispatch(loginPromptSlice.actions.hideLoginPrompt());
    store.dispatch(authSlice.actions.resetUser());
  });

  test('opens the login prompt instead of the plain error when logged out', () => {
    const onErrorMessage = jest.fn();
    const { container } = renderLink({ onErrorMessage });

    fireEvent.click(container.querySelector('a'));

    expect(store.getState().loginPrompt.text).toBe('You need to log in to use this function.');
    // This gate had no heading of its own before, so it keeps the dialog's default title.
    expect(store.getState().loginPrompt.title).toBeUndefined();
    expect(onErrorMessage).not.toHaveBeenCalled();
  });

  test('keeps the plain error message for a non-login reason', async () => {
    store.dispatch(authSlice.actions.setUser({ userdata: { sub: 'user-1' } }));
    const onErrorMessage = jest.fn();
    // Logged in but not visualizing a layer — the next reason down the chain.
    const { container } = renderLink({ onErrorMessage, isVisualizingLayer: false });

    fireEvent.click(container.querySelector('a'));

    await waitFor(() => expect(onErrorMessage).toHaveBeenCalledTimes(1));
    expect(store.getState().loginPrompt.text).toBeNull();
  });
});
