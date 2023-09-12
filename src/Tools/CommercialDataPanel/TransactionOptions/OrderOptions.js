import React from 'react';
import { TPDICollections } from '@sentinel-hub/sentinelhub-js';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../../Notification/NotificationPanel';
import { CollectionSelection } from './CollectionSelection';
import { OrderInputTooltip } from './OrderInputTooltip';
import { t } from 'ttag';

import 'react-toggle/style.css';
import './TransactionOptions.scss';
import { renderProviderSpecificTransactionParams } from './renderProviderSpecificTransactionParams';
import { OrderType } from '../../../const';
import { getProvider, getTransactionSize } from '../commercialData.utils';
import SearchForm from '../Search/SearchForm';
import { PLANET_SKYSAT_MIN_ORDER_SIZE, TPDI_PROVIDER_ORDER_WARNINGS } from '../const';

const OrderTypeLabel = {
  [OrderType.PRODUCTS]: 'Products',
  [OrderType.QUERY]: 'Query',
};

const SelectedProducts = ({ selectedProducts, removeProduct }) => {
  return (
    <div className="row">
      <label title="Products">{`Products`}</label>
      <div className="selected-products">
        {selectedProducts.map((id) => (
          <div className="selected-product" key={id}>
            <div>{id}</div>
            <i className="fa fa-trash-o" onClick={() => removeProduct(id)}></i>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderOptions = ({
  actionError,
  actionInProgress,
  aoiGeometry,
  onCreateTransaction,
  transactionOptions,
  removeProduct,
  searchParams,
  searchResults,
  selectedProducts,
  setTransactionOptions,
  setConfirmAction,
  user,
  handleSearchParamChange,
}) => {
  const validateInputs = () => {
    //order name must be entered
    const { name, type, limit, planetApiKey } = transactionOptions;
    if (!name) {
      return false;
    }

    if (type === OrderType.PRODUCTS && !!selectedProducts && !selectedProducts.length) {
      return false;
    }

    if (
      getTransactionSize(
        getProvider(searchParams.dataProvider),
        aoiGeometry,
        transactionOptions,
        selectedProducts,
        searchResults,
      ) > limit
    ) {
      return false;
    }

    if (searchParams) {
      if (
        searchParams.dataProvider === TPDICollections.PLANET_SCOPE ||
        searchParams.dataProvider === TPDICollections.PLANET_SKYSAT
      ) {
        if (!planetApiKey) {
          return false;
        }
      }
    }

    return !!aoiGeometry;
  };

  const createOrderHandler = () => {
    if (!transactionOptions.collectionId) {
      setConfirmAction({
        title: () => t`Creating order`,
        message: t`Are you sure you want to create an order without a Collection ID?  \n When you confirm your order a new collection will be created automatically.`,
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
    <div className="commercial-data-order-options">
      <div className="row">
        <label title={t`Order name`}>{t`Order name`}</label>
        <div>
          <input
            defaultValue={transactionOptions.name}
            disabled={!!actionInProgress}
            placeholder={t`e.g.: My planet data`}
            onChange={(e) => setTransactionOptions({ ...transactionOptions, name: e.target.value })}
          ></input>
          <OrderInputTooltip inputId="name" />
        </div>
      </div>

      <div className="row">
        <label title={t`Order type`}>{t`Order type`}</label>
        <div>
          <select
            className="dropdown"
            disabled={!!actionInProgress}
            value={transactionOptions.type}
            onChange={(e) =>
              setTransactionOptions({ ...transactionOptions, type: OrderType[e.target.value] })
            }
          >
            {Object.keys(OrderType).map((type, index) => (
              <option key={index} value={type}>
                {OrderTypeLabel[type]}
              </option>
            ))}
          </select>
          <OrderInputTooltip inputId="type" />
        </div>
      </div>

      {transactionOptions.type === OrderType.QUERY && (
        <SearchForm searchParams={searchParams} handleSearchParamChange={handleSearchParamChange} />
      )}

      {transactionOptions.type === OrderType.PRODUCTS && (
        <SelectedProducts selectedProducts={selectedProducts} removeProduct={removeProduct} />
      )}

      <CollectionSelection
        disabled={!!actionInProgress}
        transactionOptions={transactionOptions}
        setTransactionOptions={setTransactionOptions}
        user={user}
        searchParams={searchParams}
      />

      <div className="row">
        <label title={t`Order limit`}>{t`Order limit (km2)`}</label>
        <div>
          <input
            type="number"
            disabled={!!actionInProgress}
            defaultValue={transactionOptions.limit}
            onChange={(e) => setTransactionOptions({ ...transactionOptions, limit: e.target.value })}
            placeholder="km2"
          ></input>
          <OrderInputTooltip inputId="limit" />
        </div>
      </div>

      {transactionOptions.type === OrderType.PRODUCTS && (
        <div className="row">
          <label title={t`Order size (approx)`}>{t`Order size (approx)`}</label>
          <div>
            <label>
              {!!aoiGeometry ? (
                <>
                  {getTransactionSize(
                    getProvider(searchParams.dataProvider),
                    aoiGeometry,
                    transactionOptions,
                    selectedProducts,
                    searchResults,
                  )}{' '}
                  {`km`}
                  <sup>2</sup>
                </>
              ) : null}
            </label>
            <OrderInputTooltip inputId="size" />
          </div>
        </div>
      )}

      {searchParams &&
        searchParams.dataProvider &&
        renderProviderSpecificTransactionParams(searchParams.dataProvider, {
          actionInProgress: actionInProgress,
          transactionOptions: transactionOptions,
          searchParams: searchParams,
          setTransactionOptions: setTransactionOptions,
        })}
      {searchParams.dataProvider === TPDICollections.PLANET_SKYSAT &&
        getTransactionSize(
          getProvider(searchParams.dataProvider),
          aoiGeometry,
          transactionOptions,
          selectedProducts,
          searchResults,
        ) < PLANET_SKYSAT_MIN_ORDER_SIZE && (
          <NotificationPanel type="error" msg={TPDI_PROVIDER_ORDER_WARNINGS[TPDICollections.PLANET_SKYSAT]} />
        )}
      <div className="actions">
        <EOBButton
          className="commercial-data-button"
          fluid
          onClick={createOrderHandler}
          disabled={!validateInputs() || !!actionInProgress}
          text={t`Create order`}
          loading={actionInProgress}
        />
        <OrderInputTooltip inputId="createOrder" />
      </div>
      {actionError && <NotificationPanel type="error" msg={actionError} />}
    </div>
  );
};

export default OrderOptions;
