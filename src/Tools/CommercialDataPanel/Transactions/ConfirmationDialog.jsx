import React, { useState } from 'react';
import Rodal from 'rodal';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { t } from 'ttag';

import './ConfirmationDialog.scss';
import { NotificationPanel } from '../../../Notification/NotificationPanel';

export const ConfirmationDialog = ({ confirmAction, setConfirmAction }) => {
  const [inProgress, setInProgress] = useState(false);
  return (
    <Rodal
      animation="slideUp"
      visible={true}
      width={500}
      height={200}
      onClose={() => setConfirmAction(false)}
      closeOnEsc={true}
    >
      <div className="confirm-action-dialog">
        <b>{confirmAction.title()}</b>
        <div className="content">
          {confirmAction.message.split('\n').map((messageLine, index) => (
            <div key={index}>{messageLine}</div>
          ))}
        </div>
        {confirmAction.warning && <NotificationPanel msg={confirmAction.warning()} />}
        <div className="buttons">
          <EOBButton
            text={t`OK`}
            onClick={() => {
              setInProgress(true);
              confirmAction.action();
            }}
            disabled={inProgress}
            loading={inProgress}
          ></EOBButton>
          {!!confirmAction.showCancel && (
            <EOBButton
              text={t`Cancel`}
              onClick={() => setConfirmAction(false)}
              disabled={inProgress}
            ></EOBButton>
          )}
        </div>
      </div>
    </Rodal>
  );
};
