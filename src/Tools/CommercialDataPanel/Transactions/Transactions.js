import React, { useEffect, useLayoutEffect, useState } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { t } from 'ttag';
import { TPDITransactionStatus, TPDI, TPDProvider } from '@sentinel-hub/sentinelhub-js';
import {
  extractErrorMessage,
  fetchTransactions,
  fetchUserBYOCLayers,
  getBestMatchingLayer,
  getBoundsAndLatLng,
  formatNumberAsRoundedUnit,
  showDataOnMap,
  getTpdiCollectionFromTransaction,
} from '../commercialData.utils';
import TransactionTypeSelection from '../TransactionOptions/TransactionTypeSelection';
import store, { commercialDataSlice, mainMapSlice } from '../../../store';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../../Notification/NotificationPanel';
import ExternalLink from '../../../ExternalLink/ExternalLink';
import { TRANSACTION_TYPE } from '../../../const';
import Loader from '../../../Loader/Loader';

import './Transactions.scss';
import { TPDI_PROVIDER_ORDER_WARNINGS } from '../const';

const transactionStatusAggregator = {
  [TRANSACTION_TYPE.ORDER]: [
    {
      allowedStatuses: [TPDITransactionStatus.CREATED],
      title: () => t`Created orders (Not confirmed)`,
    },
    {
      allowedStatuses: [TPDITransactionStatus.RUNNING],
      title: () => t`Running orders`,
    },
    {
      allowedStatuses: [TPDITransactionStatus.DONE],
      title: () => t`Finished orders`,
    },
  ],
  [TRANSACTION_TYPE.SUBSCRIPTION]: [
    {
      allowedStatuses: [TPDITransactionStatus.CREATED],
      title: () => t`Created subscriptions (Not confirmed)`,
    },
    {
      allowedStatuses: [TPDITransactionStatus.RUNNING],
      title: () => t`Running subscriptions`,
    },
    {
      allowedStatuses: [TPDITransactionStatus.COMPLETED, TPDITransactionStatus.CANCELLED],
      title: () => t`Finished subscriptions`,
    },
    {
      allowedStatuses: [TPDITransactionStatus.DELETED],
      title: () => t`Deleted subscriptions`,
    },
  ],
};

const transactionMessages = {
  [TRANSACTION_TYPE.ORDER]: {
    notFound: t`No orders found`,
    confirmErrorTitle: t`Error confirming order`,
    deleteErrorTitle: t`Error deleting order`,
    confirmTitle: t`Confirm order`,
    confirmMessage: t`Are you sure you want to confirm this order?`,
    deleteTitle: t`Delete order`,
    deleteMessage: t`Are you sure you want to delete this order?`,
    refresh: t`Refresh orders`,
  },
  [TRANSACTION_TYPE.SUBSCRIPTION]: {
    notFound: t`No subscriptions found`,
    confirmErrorTitle: t`Error confirming subscription`,
    cancelErrorTitle: t`Error cancelling subscription`,
    deleteErrorTitle: t`Error deleting subscription`,
    confirmTitle: t`Confirm subscription`,
    confirmMessage: t`Are you sure you want to confirm this subscription?`,
    deleteTitle: t`Delete subscription`,
    deleteMessage: t`Are you sure you want to delete this subscription?`,
    cancelTitle: t`Cancel subscription`,
    cancelMessage: t`Are you sure you want to cancel this subscription?`,
    refresh: t`Refresh subscriptions`,
  },
};

const transactionTypeProperties = {
  [TRANSACTION_TYPE.ORDER]: {
    confirmAction: TPDI.confirmOrder,
    deleteAction: TPDI.deleteOrder,
  },
  [TRANSACTION_TYPE.SUBSCRIPTION]: {
    confirmAction: TPDI.confirmSubscription,
    deleteAction: TPDI.deleteSubscription,
    cancelAction: TPDI.cancelSubscription,
  },
};

const TransactionProperties = {
  created: {
    label: () => t`Created at`,
    format: (value) => moment.utc(value).format('YYYY-MM-DD HH:mm:ss'),
  },
  confirmed: {
    label: () => t`Confirmed at`,
    format: (value) => moment.utc(value).format('YYYY-MM-DD HH:mm:ss'),
  },
  provider: {
    label: () => t`Provider`,
  },
  sqkm: {
    label: () => t`Size`,
    format: (value) => formatNumberAsRoundedUnit(value, 2, 'km²'),
  },
  status: {
    label: () => t`Status`,
  },
  input: {
    label: () => t`All input parameters`,
  },
  id: {
    label: () => t`ID`,
  },
  collectionId: {
    label: () => t`Collection ID`,
  },
};

const JSONProperty = (transaction, property) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const value = transaction[property];

  if (!value) {
    return null;
  }

  return (
    <>
      <div key={TransactionProperties[property].label} className="transaction-property">
        <div>
          {TransactionProperties[property] && TransactionProperties[property].label()
            ? TransactionProperties[property].label()
            : property}
          :
        </div>
        <div>
          <i
            className={`fa fa-eye${isExpanded ? '-slash' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={`${isExpanded ? t`Hide ${property} values` : t`Show ${property} values`}`}
          ></i>
        </div>
      </div>

      {isExpanded && (
        <div className="transaction-property-json">
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      )}
    </>
  );
};

const TransactionDetails = ({ transaction, setAction, layer, transactionType }) => {
  const buttons = [
    {
      title: () => t`Confirm`,
      onClick: () => setAction(transactionType, 'confirm', transaction),
      status: [TPDITransactionStatus.CREATED],
      transactionType: [TRANSACTION_TYPE.ORDER, TRANSACTION_TYPE.SUBSCRIPTION],
      icon: 'check',
      hidden: false,
    },
    {
      title: () => t`Delete`,
      onClick: () => setAction(transactionType, 'delete', transaction),
      status: [TPDITransactionStatus.CREATED, TPDITransactionStatus.DONE, TPDITransactionStatus.COMPLETED],
      transactionType: [TRANSACTION_TYPE.ORDER, TRANSACTION_TYPE.SUBSCRIPTION],
      icon: 'trash',
      hidden: false,
    },
    {
      title: () => t`Cancel`,
      onClick: () => setAction(transactionType, 'cancel', transaction),
      status: [TPDITransactionStatus.RUNNING],
      transactionType: [TRANSACTION_TYPE.SUBSCRIPTION],
      icon: 'trash',
      hidden: false,
    },
    {
      title: () => t`Show coverage`,
      onClick: () => {
        if (
          transaction &&
          transaction.input &&
          transaction.input.bounds &&
          transaction.input.bounds.geometry
        ) {
          store.dispatch(commercialDataSlice.actions.setSelectedOrder(transaction));
          const { lat, lng, zoom } = getBoundsAndLatLng(transaction.input.bounds.geometry);
          store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng, zoom: zoom }));
        }
      },
      status: [
        TPDITransactionStatus.CREATED,
        TPDITransactionStatus.DONE,
        TPDITransactionStatus.RUNNING,
        TPDITransactionStatus.COMPLETED,
        TPDITransactionStatus.CANCELLED,
      ],
      transactionType: [TRANSACTION_TYPE.ORDER, TRANSACTION_TYPE.SUBSCRIPTION],
      icon: 'crosshairs',
      hidden: false,
    },
    {
      title: () => t`Show data`,
      onClick: async () => {
        await showDataOnMap(transaction, layer);
      },
      status: [
        TPDITransactionStatus.DONE,
        TPDITransactionStatus.COMPLETED,
        TPDITransactionStatus.RUNNING,
        TPDITransactionStatus.CANCELLED,
      ],
      transactionType: [TRANSACTION_TYPE.ORDER, TRANSACTION_TYPE.SUBSCRIPTION],
      icon: 'map',
      hidden: !layer,
    },
  ];

  return (
    <div className="transaction-details">
      <div className="transaction-properties">
        {Object.keys(transaction)
          .filter((property) => !['name', 'userId', 'geometry', 'input'].includes(property))
          .map((property) => (
            <div key={property} className="transaction-property">
              <div>
                {TransactionProperties[property] && TransactionProperties[property].label()
                  ? TransactionProperties[property].label()
                  : property}
                :
              </div>
              <div>
                {TransactionProperties[property] && TransactionProperties[property].format
                  ? TransactionProperties[property].format(transaction[property])
                  : transaction[property]}
              </div>
            </div>
          ))}
        {}
      </div>
      {JSONProperty(transaction, 'input')}

      {transactionType === TRANSACTION_TYPE.ORDER &&
        transaction.provider === TPDProvider.PLANET &&
        transaction.status === TPDITransactionStatus.CREATED && (
          <NotificationPanel>
            {t`Note that it is technically possible to order more PlanetScope data than your purchased quota. Make sure your order is in line with the Hectares under Management (HUM) model to avoid overage fees.` +
              ` `}
            <ExternalLink href="https://www.sentinel-hub.com/faq/#how-the-planetscope-hectares-under-management-works">
              {t`More information`}
            </ExternalLink>
          </NotificationPanel>
        )}

      <div className="buttons">
        {buttons
          .filter(
            (button) =>
              button.status.includes(transaction.status) &&
              button.transactionType.includes(transactionType) &&
              !button.hidden,
          )
          .map((button, index) => (
            <EOBButton
              key={`${transaction.id}-${index}`}
              onClick={() => button.onClick(transaction)}
              text={button.title()}
              title={button.title()}
              icon={button.icon}
            />
          ))}
      </div>
    </div>
  );
};

const Transaction = ({
  activeItemId,
  transaction,
  setAction,
  setActiveItemId,
  refs,
  layer,
  transactionType,
}) => {
  const [showDetails, setShowDetails] = useState(transaction.id === activeItemId);

  useLayoutEffect(() => {
    if (activeItemId && activeItemId === transaction.id)
      refs[transaction.id].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }, [activeItemId, transaction, refs]);

  return (
    <div className="transaction" ref={refs[transaction.id]}>
      <div
        className="transaction-header"
        onClick={() => {
          if (showDetails && activeItemId === transaction.id) {
            setActiveItemId(null);
          }
          setShowDetails(!showDetails);
        }}
      >
        <div className="transaction-title">
          <div>{transaction.name}</div>
          <div>{moment.utc(transaction.created).format('YYYY-MM-DD')}</div>
        </div>
        <div className="toggle-details">
          <i className={`fa fa-chevron-${showDetails ? 'up' : 'down'}`} />
        </div>
      </div>
      {!!showDetails && (
        <TransactionDetails
          transaction={transaction}
          setAction={setAction}
          layer={layer}
          transactionType={transactionType}
        />
      )}
    </div>
  );
};

const TransactionsByStatus = ({
  activeItemId,
  transactions = [],
  allowedStatuses,
  setAction,
  setActiveItemId,
  title,
  userByocLayers,
  transactionType,
}) => {
  const filteredTransactions = transactions
    .filter((transaction) => allowedStatuses.includes(transaction.status))
    .sort((a, b) => moment.utc(b.created).diff(moment.utc(a.created)));

  const refs = filteredTransactions.reduce((acc, transaction) => {
    acc[transaction.id] = React.createRef();
    return acc;
  }, {});

  return (
    <div className="transactions-list">
      <div className="transaction-status">{title}</div>
      {filteredTransactions.length ? (
        <div className="transactions">
          {filteredTransactions.map((transaction) => (
            <Transaction
              key={transaction.id}
              refs={refs}
              transaction={transaction}
              setAction={setAction}
              setActiveItemId={setActiveItemId}
              activeItemId={activeItemId}
              layer={getBestMatchingLayer(userByocLayers, transaction.collectionId, 'TRUE')}
              transactionType={transactionType}
            />
          ))}
        </div>
      ) : (
        <NotificationPanel msg={transactionMessages[transactionType].notFound} type="info" />
      )}
    </div>
  );
};

export const Transactions = ({
  activeItemId,
  setActiveItemId,
  setConfirmAction,
  user,
  themesLists,
  transactionType,
  setTransactionType,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransations] = useState([]);
  const [userByocLayers, setUserByocLayers] = useState([]);

  const fetchData = async (transactionType, user, themesLists) => {
    try {
      setIsLoading(true);
      setError(null);
      const allTransactions = await fetchTransactions(transactionType, user);
      const byocLayers = await fetchUserBYOCLayers(
        user,
        themesLists && themesLists.user_instances ? themesLists.user_instances : [],
      );
      setTransations(allTransactions);
      setUserByocLayers(byocLayers);
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err));
      setTransations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(transactionType, user, themesLists);
  }, [user, themesLists, transactionType]);

  const confirmTransactionAction = async (transactionType, transaction) => {
    try {
      const requestsConfig = {
        authToken: user.access_token,
      };
      const confirmFunction = transactionTypeProperties[transactionType].confirmAction;
      const confirmedTransaction = await confirmFunction(transaction.id, requestsConfig);
      setActiveItemId(transaction.id);
      setTransations([...transactions.filter((o) => o.id !== transaction.id), { ...confirmedTransaction }]);
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
      setConfirmAction({
        title: () => transactionMessages[transactionType].confirmErrorTitle,
        message: extractErrorMessage(err),
        action: () => setConfirmAction(null),
        showCancel: false,
      });
    }
  };

  const deleteTransactionAction = async (transactionType, transaction) => {
    try {
      const requestsConfig = {
        authToken: user.access_token,
      };
      const deleteFunction = transactionTypeProperties[transactionType].deleteAction;
      await deleteFunction(transaction.id, requestsConfig);
      setTransations(transactions.filter((o) => o.id !== transaction.id));
      if (!!activeItemId) {
        setActiveItemId(null);
      }
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
      setConfirmAction({
        title: () => transactionMessages[transactionType].deleteErrorTitle,
        message: extractErrorMessage(err),
        action: () => setConfirmAction(null),
        showCancel: false,
      });
    }
  };

  const cancelTransactionAction = async (transactionType, transaction) => {
    try {
      const requestsConfig = {
        authToken: user.access_token,
      };
      const cancelFunction = transactionTypeProperties[transactionType].cancelAction;
      const cancelledTransaction = await cancelFunction(transaction.id, requestsConfig);

      setActiveItemId(cancelledTransaction.id);
      setTransations([
        ...transactions.filter((o) => o.id !== cancelledTransaction.id),
        { ...cancelledTransaction },
      ]);
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
      setConfirmAction({
        title: () => transactionMessages[transactionType].cancelErrorTitle,
        message: extractErrorMessage(err),
        action: () => setConfirmAction(null),
        showCancel: false,
      });
    }
  };

  const setAction = (transactionType, action, transaction) => {
    const collection = getTpdiCollectionFromTransaction(transaction);
    switch (action) {
      case 'confirm':
        setConfirmAction({
          title: () => transactionMessages[transactionType].confirmTitle,
          message: transactionMessages[transactionType].confirmMessage,
          warning: () => TPDI_PROVIDER_ORDER_WARNINGS[collection],
          action: () => confirmTransactionAction(transactionType, transaction),
          showCancel: true,
        });
        break;
      case 'delete':
        setConfirmAction({
          title: () => transactionMessages[transactionType].deleteTitle,
          message: transactionMessages[transactionType].deleteMessage,
          action: () => deleteTransactionAction(transactionType, transaction),
          showCancel: true,
        });
        break;
      case 'cancel':
        setConfirmAction({
          title: () => transactionMessages[transactionType].cancelTitle,
          message: transactionMessages[transactionType].cancelMessage,
          action: () => cancelTransactionAction(transactionType, transaction),
          showCancel: true,
        });
        break;

      default:
    }
  };

  return (
    <div className="commercial-data-transactions">
      <TransactionTypeSelection
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        plural={true}
      />
      {isLoading ? (
        <Loader />
      ) : (
        transactionStatusAggregator[transactionType].map((item, index) => (
          <TransactionsByStatus
            key={`${transactionType}-${index}`}
            transactions={transactions}
            allowedStatuses={item.allowedStatuses}
            title={item.title()}
            setAction={setAction}
            activeItemId={activeItemId}
            setActiveItemId={setActiveItemId}
            userByocLayers={userByocLayers}
            transactionType={transactionType}
          />
        ))
      )}
      <div className="actions-container">
        <EOBButton
          className="commercial-data-button"
          fluid
          disabled={isLoading}
          onClick={() => fetchData(transactionType, user, themesLists)}
          text={transactionMessages[transactionType].refresh}
        />
      </div>
      {!!error && <NotificationPanel type="error" msg={error} />}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
  themesLists: store.themes.themesLists,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(Transactions);
