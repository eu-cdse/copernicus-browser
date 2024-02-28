import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { TPDICollections } from '@sentinel-hub/sentinelhub-js';
import { TRANSACTION_TYPE } from '../../../const';
import SubscriptionOptions from './SubscriptionOptions';
import TransactionTypeSelection from './TransactionTypeSelection';
import OrderOptions from './OrderOptions';

const TransactionOptions = (props) => {
  const { transactionType, setTransactionType, searchParams } = props;

  useEffect(() => {
    if (
      searchParams.dataProvider !== TPDICollections.PLANET_SCOPE &&
      transactionType === TRANSACTION_TYPE.SUBSCRIPTION
    ) {
      setTransactionType(TRANSACTION_TYPE.ORDER);
    }
  }, [transactionType, searchParams.dataProvider, setTransactionType]);

  return (
    <>
      {searchParams.dataProvider === TPDICollections.PLANET_SCOPE && (
        <TransactionTypeSelection transactionType={transactionType} setTransactionType={setTransactionType} />
      )}
      {searchParams.dataProvider === TPDICollections.PLANET_SCOPE &&
        transactionType === TRANSACTION_TYPE.SUBSCRIPTION && <SubscriptionOptions {...props} />}
      {transactionType === TRANSACTION_TYPE.ORDER && <OrderOptions {...props} />}
    </>
  );
};

const mapStoreToProps = (store) => ({
  aoiGeometry: store.aoi.geometry,
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(TransactionOptions);
