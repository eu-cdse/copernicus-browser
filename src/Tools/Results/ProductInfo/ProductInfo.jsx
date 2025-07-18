import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { addProductsToWorkspace, getAvailableProcesorsForProducts } from '../../../api/OData/workspace';

import WorkspacePlusIcon from '../../../icons/workspace-plus.svg?react';

import './ProductInfo.scss';
import store, { notificationSlice } from '../../../store';
import { ResultItemLabels } from '../ResultItemFooter';
import Footprint from './Footprint';
import ProductPreview from '../ProductPreview/ProductPreview';
import CollapsiblePanel from '../../../components/CollapsiblePanel/CollapsiblePanel';
import ProductLink from './ProductLink';
import {
  getAllProductAttributes,
  getProductErrorMessage,
  productAttributesSections,
} from './ProductInfo.utils';
import Select, { components } from 'react-select';
import { CustomDropdownIndicator } from '../../../components/CustomSelectInput/CustomDropdownIndicator';
import { customSelectStyle } from '../../../components/CustomSelectInput/CustomSelectStyle';
import ChevronDown from '../../../icons/chevron-down.svg?react';
import ChevronUp from '../../../icons/chevron-up.svg?react';
import { textColor, mainMedium } from '../../../variables.module.scss';
import { getLoggedInErrorMsg } from '../../../junk/ConstMessages';

const DropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <CustomDropdownIndicator {...props} chevronDown={ChevronDown} chevronUp={ChevronUp} />
      </components.DropdownIndicator>
    )
  );
};

const SectionGroup = ({ className, title, children }) => (
  <div className={`section-group ${className}`}>
    <h3>{title}</h3>
    {children}
  </div>
);

const ProductInfo = ({ product, onDownload, downloadInProgress, onClose, userToken, lat, lng }) => {
  const [availableProcessors, setAvailableProcessors] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    preview: !!product?.previewUrl,
    footprint: !!product?.geometry,
  });
  const accessValidation = {
    userToken,
    product,
  };

  const allAttributes = getAllProductAttributes(product);

  const downloadProductErrorMessage = getProductErrorMessage(
    ResultItemLabels.downloadProductLabel(),
    accessValidation,
  );

  const workspaceProductErrorMessage = getProductErrorMessage(
    ResultItemLabels.addProductsToWorkspace(),
    accessValidation,
  );

  const downloadDisabled = downloadInProgress || downloadProductErrorMessage;

  useEffect(() => {
    (async () => {
      const workflows = await getAvailableProcesorsForProducts([product.id]);
      setAvailableProcessors(workflows);
    })();
  }, [product]);

  const onDisabledClickOrderProcessing = () => {
    let errorMessage = !userToken
      ? getLoggedInErrorMsg()
      : !availableProcessors.length
      ? ResultItemLabels.noAvailableProcessors()
      : !selectedWorkflow
      ? ResultItemLabels.noWorkspaceSelected()
      : t`Unknown error`;

    store.dispatch(notificationSlice.actions.displayError(`${t`Order Processing`}\n${errorMessage}`));
  };
  const onClickOrderProcessing = () => {
    window.open(
      `https://workspace.dataspace.copernicus.eu/workspace/processing-center/${selectedWorkflow.Name}/${product.name}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="product-info">
      <div className="main">
        <div className="product-info-content">
          <div className="column attributes-workflows">
            <div className="column attributes">
              <SectionGroup title={`Attributes`}>
                {productAttributesSections.map((section) => (
                  <CollapsiblePanel
                    key={section.id}
                    className={'section'}
                    title={section.title()}
                    headerComponent={section.title()}
                    expanded={expandedSections[section.id]}
                    toggleExpanded={() => {
                      setExpandedSections((prevState) => ({
                        ...prevState,
                        [section.id]: !prevState[section.id],
                      }));
                    }}
                  >
                    {(expanded) => {
                      if (!expanded || !section.render) {
                        return null;
                      }
                      return section.render({
                        section,
                        attributes: allAttributes,
                        product: product,
                        userToken,
                        downloadInProgress,
                        onDownload,
                      });
                    }}
                  </CollapsiblePanel>
                ))}
              </SectionGroup>
            </div>
            <SectionGroup title={`Workflows`} className="workflow-section">
              <div className="workflows">
                <Select
                  isDisabled={!userToken}
                  value={
                    selectedWorkflow
                      ? {
                          value: selectedWorkflow.Id,
                          label: selectedWorkflow.DisplayName,
                        }
                      : null
                  }
                  options={availableProcessors.map((workflow) => ({
                    value: workflow.Id,
                    label: workflow.DisplayName,
                  }))}
                  placeholder={t`Select workflow`}
                  onChange={(v) => {
                    const selectedWorkflow = availableProcessors.find(
                      (workflow) => workflow.Id === parseInt(v.value),
                    );
                    if (selectedWorkflow) {
                      setSelectedWorkflow(selectedWorkflow);
                    }
                  }}
                  components={{ DropdownIndicator }}
                  menuShouldBlockScroll={true}
                  menuShouldScrollIntoView={true}
                  menuPlacement="bottom"
                  menuPosition="absolute"
                  menuPortalTarget={document.body}
                  styles={{
                    ...customSelectStyle,
                    menuPortal: (css) => ({
                      ...customSelectStyle.menuPortal(css),
                      zIndex: 9999,
                    }),
                    menu: (css) => ({
                      ...customSelectStyle.menu(css),
                      minWidth: 'unset',
                      width: 'inherit',
                    }),
                    input: (css) => ({
                      ...customSelectStyle.input(css),
                      color: textColor,
                    }),
                    singleValue: (css, state) => ({
                      ...customSelectStyle.singleValue(css, state),
                      color: state.isDisabled ? '#999' : textColor,
                    }),
                    control: (css, state) => ({
                      ...customSelectStyle.control(css, state),
                      width: 250,
                      backgroundColor: mainMedium,
                      opacity: state.isDisabled ? 0.6 : 1,
                    }),
                  }}
                />

                <div className="workflow-details">
                  {(selectedWorkflow && (
                    <>
                      <h4>{selectedWorkflow.DisplayName}</h4>
                      <p>
                        <span>{t`Name`}:</span> {selectedWorkflow.Name}{' '}
                      </p>
                      <p>
                        <span>{t`Description`}:</span> {selectedWorkflow.Description}
                      </p>
                    </>
                  )) || (
                    <div className="error-message">
                      {!availableProcessors.length
                        ? ResultItemLabels.noAvailableProcessors()
                        : ResultItemLabels.noWorkspaceSelected()}
                    </div>
                  )}
                </div>
              </div>
              <EOBButton
                icon="play"
                text={t`Order processing`}
                title={ResultItemLabels.orderProcessing()}
                onClick={onClickOrderProcessing}
                onDisabledClick={onDisabledClickOrderProcessing}
                disabled={!selectedWorkflow || !availableProcessors.length}
                className="process-btn"
              />
            </SectionGroup>
          </div>

          <div className="column previews">
            <SectionGroup className="preview" title={t`Preview`}>
              {product?.previewUrl ? (
                <ProductPreview product={product} />
              ) : (
                <div className="error-message">{t`No preview available`}</div>
              )}
            </SectionGroup>
            <SectionGroup className="footprint" title={t`Footprint`}>
              <Footprint product={product} lat={lat} lng={lng} />
            </SectionGroup>
          </div>
        </div>
      </div>

      <div className="footer">
        <ProductLink product={product} />
        <div className="actions">
          <EOBButton
            disabled={workspaceProductErrorMessage}
            svgIcon={WorkspacePlusIcon}
            text={t`Workspace`}
            title={ResultItemLabels.addProductsToWorkspace()}
            onClick={() => {
              addProductsToWorkspace([product]);
              onClose();
            }}
            onDisabledClick={() => {
              if (workspaceProductErrorMessage) {
                store.dispatch(notificationSlice.actions.displayError(workspaceProductErrorMessage));
              }
            }}
          ></EOBButton>
          <EOBButton
            disabled={downloadDisabled}
            loading={downloadInProgress}
            icon="download"
            text={t`Download`}
            title={ResultItemLabels.downloadProductLabel()}
            onClick={onDownload}
            onDisabledClick={() => {
              if (downloadProductErrorMessage) {
                store.dispatch(notificationSlice.actions.displayError(downloadProductErrorMessage));
              }
            }}
          ></EOBButton>
        </div>
      </div>
    </div>
  );
};
const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  userToken: store.auth.user.access_token,
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
});

export default connect(mapStoreToProps, null)(ProductInfo);
