import React from 'react';
import { PlanetScopeHarmonization, TPDICollections, ResamplingKernel } from '@sentinel-hub/sentinelhub-js';
import { OrderInputTooltip } from './OrderInputTooltip';
import { t } from 'ttag';
import { isPlanetHarmonizationSupported, defaultPlanetHarmonizeTo } from '../CommercialDataPanel';

const getResamplingKernelLabel = (productKernel) => {
  const ResamplingKernelLabel = {
    [ResamplingKernel.CC]: `CC - ${t`4x4 cubic convolution`}`,
    [ResamplingKernel.NN]: `NN - ${t`nearest neighbour`}`,
    [ResamplingKernel.MTF]: `MTF - ${t`proprietary MTF kernel`}`,
  };

  return ResamplingKernelLabel[productKernel] || productKernel;
};

const renderMaxarTransactionParams = (
  actionInProgress,
  searchParams,
  transactionOptions,
  setTransactionOptions,
) => {
  return (
    <div className="row">
      <label title={t`Resampling kernel`}>{t`Resampling kernel`}</label>
      <div>
        <select
          className="dropdown"
          disabled={!!actionInProgress}
          value={transactionOptions.productKernel}
          onChange={(e) =>
            setTransactionOptions({ ...transactionOptions, productKernel: ResamplingKernel[e.target.value] })
          }
        >
          {Object.keys(ResamplingKernel).map((productKernel, index) => (
            <option key={index} value={productKernel}>
              {getResamplingKernelLabel(productKernel)}
            </option>
          ))}
        </select>
        <OrderInputTooltip inputId="productKernel" />
      </div>
    </div>
  );
};

const renderPlanetScopeTransactionParams = (
  actionInProgress,
  searchParams,
  transactionOptions,
  setTransactionOptions,
) => {
  return (
    <>
      <div className="row">
        <label title={t`Harmonize to`}>{t`Harmonize to`}</label>
        <div>
          <select
            className="dropdown"
            disabled={
              !!actionInProgress ||
              !isPlanetHarmonizationSupported(searchParams.itemType, searchParams.productBundle)
            }
            value={transactionOptions.harmonizeTo}
            onChange={(e) => {
              setTransactionOptions({ ...transactionOptions, harmonizeTo: e.target.value });
            }}
          >
            <option key={PlanetScopeHarmonization.NONE} value={PlanetScopeHarmonization.NONE}>
              {PlanetScopeHarmonization.NONE}
            </option>

            <option
              key={defaultPlanetHarmonizeTo[searchParams.itemType]}
              value={defaultPlanetHarmonizeTo[searchParams.itemType]}
            >
              {defaultPlanetHarmonizeTo[searchParams.itemType]}
            </option>
          </select>
          <OrderInputTooltip inputId="harmonizeData" />
        </div>
      </div>

      <div className="row">
        <label title={t`Planet API Key`}>{t`Planet API Key`}</label>
        <div>
          <input
            type="text"
            disabled={!!actionInProgress}
            defaultValue={transactionOptions.planetApiKey}
            onChange={(e) => setTransactionOptions({ ...transactionOptions, planetApiKey: e.target.value })}
            placeholder={t`Your Planet API key`}
          ></input>
          <OrderInputTooltip inputId="planetApiKey" />
        </div>
      </div>
    </>
  );
};

const renderPlanetSkySatTransactionParams = (
  actionInProgress,
  searchParams,
  transactionOptions,
  setTransactionOptions,
) => {
  return (
    <>
      <div className="row">
        <label title={t`Harmonize to`}>{t`Harmonize to`}</label>
        <div>
          <select
            className="dropdown"
            disabled={
              !!actionInProgress ||
              !isPlanetHarmonizationSupported(searchParams.itemType, searchParams.productBundle)
            }
            value={transactionOptions.harmonizeTo}
            onChange={(e) => {
              setTransactionOptions({ ...transactionOptions, harmonizeTo: e.target.value });
            }}
          >
            <option key={PlanetScopeHarmonization.NONE} value={PlanetScopeHarmonization.NONE}>
              {PlanetScopeHarmonization.NONE}
            </option>
          </select>
          <OrderInputTooltip inputId="harmonizeData" />
        </div>
      </div>
      <div className="row">
        <label title={t`Planet API Key`}>{t`Planet API Key`}</label>
        <div>
          <input
            type="text"
            disabled={!!actionInProgress}
            defaultValue={transactionOptions.planetApiKey}
            onChange={(e) => setTransactionOptions({ ...transactionOptions, planetApiKey: e.target.value })}
            placeholder={t`Your Planet API key`}
          ></input>
          <OrderInputTooltip inputId="planetApiKey" />
        </div>
      </div>
    </>
  );
};

export const renderProviderSpecificTransactionParams = (
  dataProvider,
  { actionInProgress, searchParams, transactionOptions, setTransactionOptions },
) => {
  switch (dataProvider) {
    case TPDICollections.PLANET_SCOPE:
      return renderPlanetScopeTransactionParams(
        actionInProgress,
        searchParams,
        transactionOptions,
        setTransactionOptions,
      );
    case TPDICollections.PLANET_SKYSAT:
      return renderPlanetSkySatTransactionParams(
        actionInProgress,
        searchParams,
        transactionOptions,
        setTransactionOptions,
      );
    case TPDICollections.MAXAR_WORLDVIEW:
      return renderMaxarTransactionParams(
        actionInProgress,
        searchParams,
        transactionOptions,
        setTransactionOptions,
      );

    default:
      return null;
  }
};
