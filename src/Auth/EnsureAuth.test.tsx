import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnsureAuth from './EnsureAuth';
import { getRecaptchaConsentFromLocalStorage } from './authHelpers';

jest.mock('./authHelpers', () => ({
  getRecaptchaConsentFromLocalStorage: jest.fn(() => false),
}));
const mockGetRecaptchaConsent = getRecaptchaConsentFromLocalStorage as jest.Mock;

const mockDoLogin = jest.fn();
jest.mock('./loginLogout/useLoginLogout', () => () => ({
  doLogin: mockDoLogin,
  doLogout: jest.fn(),
}));

const baseProps = {
  user: null,
  anonToken: null,
  tokenRefreshInProgress: false,
  userAuthCompleted: true,
  blockingModalOpen: false,
};

const anonButton = () => screen.getByRole('button', { name: 'Use anonymously' });
const loginButton = () => screen.getByRole('button', { name: 'Log in' });

describe('EnsureAuth', () => {
  beforeEach(() => {
    mockDoLogin.mockClear();
  });

  test('shows a spinner and ignores clicks on the anonymous button while anonAuthInProgress is true', () => {
    const executeAnonAuth = jest.fn();
    const { container } = render(
      <EnsureAuth {...baseProps} anonAuthInProgress={true} executeAnonAuth={executeAnonAuth} />,
    );

    expect(container.querySelector('.fa-spinner')).toBeInTheDocument();
    expect(container.querySelector('.loader')).toBeInTheDocument();

    // The label is visibility:hidden while loading, so the button has no accessible name to query by.
    const button = screen.getByText('Use anonymously').closest('button');
    expect(button).toBeDisabled();
    fireEvent.click(button!);

    expect(executeAnonAuth).not.toHaveBeenCalled();
  });

  test('does not show a spinner and calls executeAnonAuth on click when anonAuthInProgress is false', () => {
    const executeAnonAuth = jest.fn();
    const { container } = render(
      <EnsureAuth {...baseProps} anonAuthInProgress={false} executeAnonAuth={executeAnonAuth} />,
    );

    expect(container.querySelector('.fa-spinner')).not.toBeInTheDocument();
    expect(container.querySelector('.loader')).not.toBeInTheDocument();

    expect(anonButton()).not.toBeDisabled();
    fireEvent.click(anonButton());

    expect(executeAnonAuth).toHaveBeenCalledTimes(1);
  });

  test('renders nothing when blockingModalOpen is true', () => {
    const { container } = render(
      <EnsureAuth
        {...baseProps}
        blockingModalOpen={true}
        anonAuthInProgress={false}
        executeAnonAuth={jest.fn()}
      />,
    );

    expect(container.querySelector('.confirm-dialog')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  test('renders through the shared dialog with the title, both copy lines and the consent notice', () => {
    const { container, getByText } = render(
      <EnsureAuth {...baseProps} anonAuthInProgress={false} executeAnonAuth={jest.fn()} />,
    );

    // The shared AuthConfirmDialog shell, not EnsureAuth's own former markup.
    expect(container.querySelector('.confirm-dialog')).toBeInTheDocument();
    // `.ensure-auth` is what two e2e specs locate the dialog by — it must survive the refactor.
    expect(container.querySelector('.rodal.ensure-auth')).toBeInTheDocument();

    expect(getByText('Welcome To Copernicus Browser!')).toBeInTheDocument();
    expect(
      getByText(
        'Log in to unlock advanced features such as timelapse, analytical download, and your own configurations.',
      ),
    ).toBeInTheDocument();

    expect(container.querySelector('.confirm-dialog__footer')).toHaveTextContent(
      'you consent to the use of cookies by recaptcha.net',
    );
  });

  test('is centered in the viewport, unlike the shared feature prompt', () => {
    const { container } = render(
      <EnsureAuth {...baseProps} anonAuthInProgress={false} executeAnonAuth={jest.fn()} />,
    );

    expect(container.querySelector('.rodal-dialog')).toHaveStyle({ top: '50%' });
  });

  test('is not dismissible: no close button is rendered', () => {
    const { container } = render(
      <EnsureAuth {...baseProps} anonAuthInProgress={false} executeAnonAuth={jest.fn()} />,
    );

    expect(container.querySelector('.rodal-close')).not.toBeInTheDocument();
  });

  test('triggers the Keycloak login on the primary button', () => {
    render(<EnsureAuth {...baseProps} anonAuthInProgress={false} executeAnonAuth={jest.fn()} />);

    fireEvent.click(loginButton());

    expect(mockDoLogin).toHaveBeenCalledTimes(1);
  });

  describe('when recaptcha consent was already given', () => {
    afterEach(() => {
      mockGetRecaptchaConsent.mockReturnValue(false);
    });

    test('keeps the modal open via the anonAuthInProgress escape hatch', () => {
      mockGetRecaptchaConsent.mockReturnValue(true);
      const { container } = render(
        <EnsureAuth {...baseProps} anonAuthInProgress={true} executeAnonAuth={jest.fn()} />,
      );

      expect(container.querySelector('.confirm-dialog')).toBeInTheDocument();
    });

    test('renders nothing once anonAuthInProgress is false', () => {
      mockGetRecaptchaConsent.mockReturnValue(true);
      const { container } = render(
        <EnsureAuth {...baseProps} anonAuthInProgress={false} executeAnonAuth={jest.fn()} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
