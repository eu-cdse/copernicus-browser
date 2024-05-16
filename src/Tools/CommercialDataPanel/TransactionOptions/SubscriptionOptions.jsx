import React from 'react';
import { TPDICollections } from '@sentinel-hub/sentinelhub-js';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../../Notification/NotificationPanel';
import { CollectionSelection } from './CollectionSelection';
import { OrderInputTooltip } from './OrderInputTooltip';
import { t } from 'ttag';

import SearchForm from '../Search/SearchForm';

import 'react-toggle/style.css';
import './TransactionOptions.scss';
import { renderProviderSpecificTransactionParams } from './renderProviderSpecificTransactionParams';

const SubscriptionOptions = ({
  actionError,
  actionInProgress,
  aoiGeometry,
  onCreateTransaction,
  transactionOptions,
  searchParams,
  setTransactionOptions,
  setConfirmAction,
  user,
  handleSearchParamChange,
}) => {
  const validateInputs = () => {
    // name must be entered
    const { name, planetApiKey } = transactionOptions;
    if (!name) {
      return false;
    }

    if (searchParams && searchParams.dataProvider === TPDICollections.PLANET_SCOPE && !planetApiKey) {
      return false;
    }

    return !!aoiGeometry;
  };

  const createSubscriptionHandler = () => {
    if (!transactionOptions.collectionId) {
      setConfirmAction({
        title: () => t`Creating subscription`,
        message: t`Are you sure you want to create an subscription without a Collection ID?  \n When you confirm your subscription a new collection will be created automatically.`,
        action: () => {
          onCreateTransaction();
          setConfirmAction(null);
        },
        showCancel: true,
      });
      return;
    }

    onCreateTransaction();
  };

  return (
    <div className="commercial-data-subscription-options">
      <div className="row">
        <label title={t`Subscription name`}>{t`Subscription name`}</label>
        <div>
          <input
            defaultValue={transactionOptions.name}
            disabled={!!actionInProgress}
            placeholder={t`e.g.: My planet data`}
            onChange={(e) => setTransactionOptions({ ...transactionOptions, name: e.target.value })}
          ></input>
          <OrderInputTooltip inputId="subscriptionName" />
        </div>
      </div>
      <SearchForm searchParams={searchParams} handleSearchParamChange={handleSearchParamChange} />

      <CollectionSelection
        disabled={!!actionInProgress}
        transactionOptions={transactionOptions}
        setTransactionOptions={setTransactionOptions}
        user={user}
        searchParams={searchParams}
      />
      {searchParams &&
        searchParams.dataProvider &&
        renderProviderSpecificTransactionParams(searchParams.dataProvider, {
          actionInProgress: actionInProgress,
          transactionOptions: transactionOptions,
          searchParams: searchParams,
          setTransactionOptions: setTransactionOptions,
        })}

      <div className="actions">
        <EOBButton
          className="commercial-data-button"
          fluid
          onClick={createSubscriptionHandler}
          disabled={!validateInputs() || !!actionInProgress}
          text={t`Create subscription`}
          loading={actionInProgress}
        />
        <OrderInputTooltip inputId="createSubscription" />
      </div>
      {actionError && <NotificationPanel type="error" msg={actionError} />}
    </div>
  );
};

export default SubscriptionOptions;
