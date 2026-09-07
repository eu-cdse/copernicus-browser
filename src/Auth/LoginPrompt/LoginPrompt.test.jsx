import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import LoginPrompt from './LoginPrompt';
import { openLoginPrompt } from './loginPrompt.utils';
import store, { loginPromptSlice } from '../../store';
import { openLogin } from '../authHelpers';

jest.mock('../authHelpers', () => ({
  openLogin: jest.fn(),
  logoutUser: jest.fn(),
}));

const renderPrompt = () =>
  render(
    <Provider store={store}>
      <LoginPrompt />
    </Provider>,
  );

describe('LoginPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(loginPromptSlice.actions.hideLoginPrompt());
  });

  test('renders nothing while no prompt text is set', () => {
    const { container } = renderPrompt();

    expect(container).toBeEmptyDOMElement();
  });

  test('renders the shared auth dialog with the default title and buttons', () => {
    store.dispatch(
      loginPromptSlice.actions.showLoginPrompt({ text: 'You need to be logged in to do a thing.' }),
    );
    renderPrompt();

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('You need to be logged in to do a thing.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue without logging in' })).toBeInTheDocument();
  });

  test('renders the feature title when one is given', () => {
    openLoginPrompt('You need to log in to use this function.', 'Order Processing');
    renderPrompt();

    expect(screen.getByText('Order Processing')).toBeInTheDocument();
    expect(screen.queryByText('Authentication Required')).not.toBeInTheDocument();
    expect(screen.getByText('You need to log in to use this function.')).toBeInTheDocument();
  });

  test('"Log in" starts the login flow and clears the prompt', () => {
    store.dispatch(loginPromptSlice.actions.showLoginPrompt({ text: 'some message' }));
    renderPrompt();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(openLogin).toHaveBeenCalledTimes(1);
    expect(store.getState().loginPrompt.text).toBeNull();
  });

  test('"Continue without logging in" closes the prompt without logging in', () => {
    store.dispatch(loginPromptSlice.actions.showLoginPrompt({ text: 'some message' }));
    renderPrompt();

    fireEvent.click(screen.getByRole('button', { name: 'Continue without logging in' }));

    expect(openLogin).not.toHaveBeenCalled();
    expect(store.getState().loginPrompt.text).toBeNull();
  });

  test('openLoginPrompt shows the message the feature used to pass to displayError', () => {
    openLoginPrompt('You need to log in to use this function.');

    expect(store.getState().loginPrompt.text).toBe('You need to log in to use this function.');
    expect(store.getState().loginPrompt.title).toBeUndefined();
  });
});
