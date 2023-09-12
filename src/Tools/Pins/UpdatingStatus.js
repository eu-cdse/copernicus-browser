import React from 'react';
import { t } from 'ttag';

import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';

const UpdatingStatus = ({ updatingPins, updatingPinsError }) => (
  <>
    {updatingPins && <NotificationPanel type="loading" msg={t`Updating pin collection.`} />}
    {updatingPinsError && (
      <NotificationPanel
        type="error"
        msg={t`There was a problem permanently updating the pin collection: ${updatingPinsError}.`}
      />
    )}
  </>
);

export default UpdatingStatus;
