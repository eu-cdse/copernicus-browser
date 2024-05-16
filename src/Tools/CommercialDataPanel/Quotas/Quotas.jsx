import React from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import { TPDICollections } from '@sentinel-hub/sentinelhub-js';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../../Notification/NotificationPanel';
import { formatNumberAsRoundedUnit } from '../commercialData.utils';

import './Quotas.scss';

const Providers = {
  [TPDICollections.AIRBUS_PLEIADES]: 'Airbus Pleiades',
  [TPDICollections.AIRBUS_SPOT]: 'Airbus SPOT',
  [TPDICollections.PLANET_SCOPE]: 'Planet PlanetScope',
  [TPDICollections.MAXAR_WORLDVIEW]: 'Maxar WorldView',
  [TPDICollections.PLANET_SKYSAT]: 'Planet SkySat',
};

function renderQuotas(quotas) {
  return (
    <>
      <table>
        <thead>
          <tr>
            <td>{t`Provider`}</td>
            <td>
              {t`Purchased km`}
              <sup>2</sup>
            </td>
            <td>
              {t`Used km`}
              <sup>2</sup>
            </td>
          </tr>
        </thead>
        <tbody>
          {quotas.map((quota) => {
            return (
              <tr key={quota.id}>
                <td>{`${Providers[quota.collectionId]}`}</td>
                <td>{`${formatNumberAsRoundedUnit(quota.quotaSqkm, 2, '', t`N/A`)}`}</td>
                <td>{`${formatNumberAsRoundedUnit(quota.quotaUsed, 2, '', t`N/A`)}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {quotas && quotas.length === 0 && <NotificationPanel msg={t`No quotas available`} type="info" />}
    </>
  );
}

const Quotas = ({ user, quotas, isLoading, error, fetchQuotas }) => {
  return (
    <div className="commercial-data-quotas">
      {renderQuotas(quotas)}
      <EOBButton
        className="commercial-data-button"
        loading={isLoading}
        disabled={isLoading}
        fluid
        onClick={() => fetchQuotas(user)}
        text={t`Refresh quotas`}
      />
      {!!error && <NotificationPanel type="error" msg={error} />}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(Quotas);
