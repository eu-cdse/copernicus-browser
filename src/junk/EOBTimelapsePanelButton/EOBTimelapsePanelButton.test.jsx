import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { EOBTimelapsePanelButton } from './EOBTimelapsePanelButton';
import store, { loginPromptSlice } from '../../store';

const renderButton = (props) =>
  render(<EOBTimelapsePanelButton isLoggedIn={false} onErrorMessage={jest.fn()} {...props} />);

describe('EOBTimelapsePanelButton', () => {
  beforeEach(() => {
    store.dispatch(loginPromptSlice.actions.hideLoginPrompt());
  });

  test('opens the login prompt instead of the plain error when logged out', () => {
    const onErrorMessage = jest.fn();
    const { container } = renderButton({ onErrorMessage });

    fireEvent.click(container.querySelector('.timelapsePanelButton'));

    expect(store.getState().loginPrompt.text).toBe('You need to log in to use this function.');
    expect(store.getState().loginPrompt.title).toBe('Create timelapse animation');
    expect(onErrorMessage).not.toHaveBeenCalled();
  });

  test('keeps the plain error message for reasons that outrank the login check', () => {
    // errorOverride and compare mode sit above the login check in the errMsg chain, so they must
    // stay plain notifications even while logged out.
    const onErrorMessage = jest.fn();
    const { container } = renderButton({ showComparePanel: true, onErrorMessage });

    fireEvent.click(container.querySelector('.timelapsePanelButton'));

    expect(store.getState().loginPrompt.text).toBeNull();
    expect(onErrorMessage).toHaveBeenCalledTimes(1);
  });
});
