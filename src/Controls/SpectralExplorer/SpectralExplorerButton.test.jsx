import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import SpectralExplorerButton from './SpectralExplorerButton';
import store, { loginPromptSlice } from '../../store';

jest.mock('../../icons/spectral_explorer.svg?react', () => ({
  __esModule: true,
  default: () => <svg />,
}));

describe('SpectralExplorerButton', () => {
  beforeEach(() => {
    store.dispatch(loginPromptSlice.actions.hideLoginPrompt());
  });

  test('opens the login prompt instead of the plain error when logged out', () => {
    const onErrorMessage = jest.fn();
    // auth.user.userdata is null by default (anonymous session), which is the button's
    // highest-precedence disabled reason.
    const { container } = render(
      <Provider store={store}>
        <SpectralExplorerButton onErrorMessage={onErrorMessage} />
      </Provider>,
    );

    fireEvent.click(container.querySelector('a'));

    expect(store.getState().loginPrompt.text).toBe('You need to log in to use this function.');
    expect(store.getState().loginPrompt.title).toBe('Spectral explorer');
    expect(onErrorMessage).not.toHaveBeenCalled();
  });
});
