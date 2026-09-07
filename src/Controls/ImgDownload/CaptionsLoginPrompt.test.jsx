import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import BasicForm from './BasicForm';
import TerrainViewerForm from './TerrainViewerForm';
import store, { loginPromptSlice } from '../../store';

const LOGGED_OUT_MSG = 'You need to login to use this functionality.';

const formProps = {
  updateFormData: jest.fn(),
  showCaptions: false,
  userDescription: '',
};

describe.each([
  ['BasicForm', BasicForm],
  ['TerrainViewerForm', TerrainViewerForm],
])('%s captions info icon', (_name, Form) => {
  beforeEach(() => {
    store.dispatch(loginPromptSlice.actions.hideLoginPrompt());
  });

  test('opens the login prompt instead of the plain error when logged out', () => {
    const onErrorMessage = jest.fn();
    const { container } = render(
      <Form {...formProps} isUserLoggedIn={false} onErrorMessage={onErrorMessage} />,
    );

    fireEvent.click(container.querySelector('.fa-info-circle'));

    expect(store.getState().loginPrompt.text).toBe(LOGGED_OUT_MSG);
    expect(onErrorMessage).not.toHaveBeenCalled();
  });

  test('shows the plain informational message when logged in', () => {
    const onErrorMessage = jest.fn();
    const { container } = render(
      <Form {...formProps} isUserLoggedIn={true} onErrorMessage={onErrorMessage} />,
    );

    fireEvent.click(container.querySelector('.fa-info-circle'));

    expect(store.getState().loginPrompt.text).toBeNull();
    expect(onErrorMessage).toHaveBeenCalledTimes(1);
    expect(onErrorMessage).not.toHaveBeenCalledWith(LOGGED_OUT_MSG);
  });
});
