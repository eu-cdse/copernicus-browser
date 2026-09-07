import React from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import AuthConfirmDialog from '../../components/AuthConfirmDialog/AuthConfirmDialog';
import useLoginLogout from '../loginLogout/useLoginLogout';
import store, { loginPromptSlice } from '../../store';

// Global prompt shown when an anonymous user triggers a feature that requires being logged in.
// Rendered after <Notification /> in App.jsx so it stacks above any modal the feature lives in.
// `title` is optional — features that had no heading of their own get the generic one.
const LoginPrompt = ({ text, title }) => {
  const { doLogin } = useLoginLogout();

  if (!text) {
    return null;
  }

  const close = () => store.dispatch(loginPromptSlice.actions.hideLoginPrompt());

  return (
    <AuthConfirmDialog
      title={title ?? t`Authentication Required`}
      text={text}
      okLabel={t`Log in`}
      cancelLabel={t`Continue without logging in`}
      onOk={async () => {
        // openLogin() redirects to Keycloak, so the prompt is torn down by the page navigation.
        // Closing first keeps the state clean if the redirect fails and we stay on the page.
        close();
        await doLogin();
      }}
      onCancel={close}
      // Unlike the blocking startup dialogs this is a dismissible feature gate, so Escape and a
      // click on the backdrop both mean "continue without logging in".
      closeOnEsc={true}
      onClose={close}
    />
  );
};

const mapStoreToProps = (store) => ({
  text: store.loginPrompt.text,
  title: store.loginPrompt.title,
});

export default connect(mapStoreToProps)(LoginPrompt);
