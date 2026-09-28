import React from 'react';
import { t } from 'ttag';
import ReactMarkdown from 'react-markdown';
import type { PluggableList } from 'unified';

import AuthConfirmDialog from '../components/AuthConfirmDialog/AuthConfirmDialog';
import useLoginLogout from './loginLogout/useLoginLogout';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../rehypeConfig';
import { getRecaptchaConsentFromLocalStorage } from './authHelpers';

import './EnsureAuth.scss';

interface LoginRequiredProps {
  executeAnonAuth: () => void;
  anonAuthInProgress?: boolean;
}

interface EnsureAuthProps extends LoginRequiredProps {
  user?: object | null;
  anonToken?: string | null;
  tokenRefreshInProgress?: boolean;
  userAuthCompleted?: boolean;
  blockingModalOpen?: boolean;
}

// Initial call-to-login dialog, shown on first page load before any token exists. It renders
// through the shared AuthConfirmDialog so it stays visually consistent with the feature login
// prompt (LoginPrompt) and ThemesProvider's private-configuration / CCM dialogs.
// Unlike those, this one is blocking: no close button, no Escape, no backdrop dismiss.
const LoginRequired = ({ executeAnonAuth, anonAuthInProgress }: LoginRequiredProps) => {
  const { doLogin } = useLoginLogout();

  return (
    <AuthConfirmDialog
      className="ensure-auth"
      title={t`Welcome To Copernicus Browser!`}
      text={
        <>
          <p>{t`Log in to unlock advanced features such as timelapse, analytical download, and your own configurations.`}</p>
        </>
      }
      okLabel={t`Log in`}
      onOk={doLogin}
      cancelLabel={t`Use anonymously`}
      onCancel={executeAnonAuth}
      cancelLoading={anonAuthInProgress}
      cancelDisabled={anonAuthInProgress}
      footer={
        <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS as PluggableList}>
          {t`By continuing anonymously, you consent to the use of cookies by recaptcha.net and to its collection, sharing, and use of personal data. See also [Terms and conditions](https://dataspace.copernicus.eu/terms-and-conditions)`}
        </ReactMarkdown>
      }
      closeOnEsc={false}
      // Unlike the feature prompt, this one owns the whole screen on first load, so it sits in
      // the middle rather than the shared dialog's upper third.
      centered={true}
    />
  );
};

const EnsureAuth = ({
  user,
  anonToken,
  tokenRefreshInProgress,
  executeAnonAuth,
  userAuthCompleted,
  blockingModalOpen,
  anonAuthInProgress,
}: EnsureAuthProps) => {
  // Don't show this modal while ThemesProvider is already showing its own auth dialog
  // (private theme URL or CCM access denied) — prevents two login prompts stacking.
  if (blockingModalOpen) {
    return null;
  }

  if (
    !(anonToken || user || tokenRefreshInProgress) &&
    // executeAnonAuth saves the recaptcha consent flag in the same tick it sets
    // anonAuthInProgress, so without the anonAuthInProgress escape hatch this modal
    // would unmount before ever rendering the disabled/loading "Anonymously" button.
    // anonAuthInProgress only ever becomes true for a user-initiated click (see
    // AuthProvider's isUserInitiatedAnonAuthRef) — silent background re-auth attempts never
    // set it, so they can't flash this modal open for a returning user who already consented.
    (!getRecaptchaConsentFromLocalStorage() || anonAuthInProgress) &&
    userAuthCompleted
  ) {
    return <LoginRequired executeAnonAuth={executeAnonAuth} anonAuthInProgress={anonAuthInProgress} />;
  }

  return null;
};

export default EnsureAuth;
