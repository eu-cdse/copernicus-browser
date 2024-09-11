import React, { useState } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { addProductToWorkspace } from '../../../api/OData/workspace';

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

const SectionGroup = ({ className, title, children }) => (
  <div className={`section-group ${className}`}>
    <h3>{title}</h3>
    {children}
  </div>
);

const ProductInfo = ({ product, onDownload, downloadInProgress, onClose, userToken, lat, lng }) => {
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
    ResultItemLabels.addToWorkspace(),
    accessValidation,
  );

  const downloadDisabled = downloadInProgress || downloadProductErrorMessage;

  return (
    <div className="product-info">
      <div className="main">
        <div className="product-info-content">
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
            title={ResultItemLabels.addToWorkspace()}
            onClick={() => {
              addProductToWorkspace(product);
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
