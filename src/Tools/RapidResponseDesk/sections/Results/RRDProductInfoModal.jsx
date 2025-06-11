import React, { useState } from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import { t } from 'ttag';
import store, { modalSlice } from '../../../../store';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import ProductPreview from '../../../Results/ProductPreview/ProductPreview';
import Footprint from '../../../Results/ProductInfo/Footprint';
import { getAllProductAttributes, sectionAttributes } from './RRDProductInfoModal.utils';
import './RRDProductInfoModal.scss';
// import ProductInfo from './ProductInfo';

const onClose = () => store.dispatch(modalSlice.actions.removeModal());

function renderSectionAttributes({ section, attributes }) {
  let sectionAttributes = attributes.filter((attr) => section.attributes(attributes).includes(attr.key));
  if (section.sort) {
    sectionAttributes = sectionAttributes.sort((a, b) => section.sort(a.name, b.name));
  }
  return (
    <>
      {sectionAttributes
        .filter((attr) => attr.value !== undefined && attr.value !== null && attr.value !== '')
        .map((attr) => (
          <div className={`row`} key={attr.key}>
            <div className={`attribute left`}>{attr.name}: </div>
            <div className={`attribute right`}>{attr.value}</div>
          </div>
        ))}
    </>
  );
}

const productAttributesSections = [
  {
    id: 'summary',
    title: () => t`Summary`,
    attributes: () => sectionAttributes.summary,
    render: renderSectionAttributes,
  },
  {
    id: 'product',
    title: () => t`Product`,
    attributes: (allAttributes) =>
      allAttributes.map((attr) => attr.key).filter((key) => !sectionAttributes.summary.includes(key)),
    render: renderSectionAttributes,
    // sort: (a, b) => a.localeCompare(b),
  },
];

const SectionGroup = ({ className, title, children }) => (
  <div className={`section-group ${className}`}>
    <h3>{title}</h3>
    {children}
  </div>
);

const RRDProductInfoModal = ({ selectedResult, params, lng, lat, previewImageUrl }) => {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    product: true,
    preview: !!selectedResult?.previewUrl,
    footprint: !!selectedResult?.geometry,
  });

  const attributesToMapped = [{ name: 'id', value: selectedResult.id }];
  Object.keys(selectedResult.properties).forEach((key) => {
    if (Array.isArray(selectedResult.properties[key]) && key === 'providers') {
      selectedResult.properties[key].forEach((e) => {
        Object.keys(e).forEach((k) => {
          attributesToMapped.push({ name: k, value: e[k] });
        });
      });
    } else {
      attributesToMapped.push({ name: key, value: selectedResult.properties[key] });
    }
  });

  const allAttributes = getAllProductAttributes(
    attributesToMapped,
    selectedResult.properties.metadata_source,
  );

  const { onDownload, downloadInProgress } = params;
  return (
    <Rodal
      animation="slideUp"
      className="product-info-rrd-modal"
      customStyles={{
        width: '200px',
        height: 'auto',
      }}
      visible={true}
      onClose={onClose}
      closeOnEsc={true}
    >
      <>
        <h3 className="product-info-rrd-title">{t`Product info`}</h3>

        <div className="product-info-rrd">
          <div className="main">
            <div className="product-info-rrd-content">
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
                          product: selectedResult,
                          // userToken: ,
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
                  {previewImageUrl ? (
                    <ProductPreview product={{ ...selectedResult, previewUrl: previewImageUrl }} />
                  ) : (
                    <div className="error-message">{t`No preview available`}</div>
                  )}
                </SectionGroup>
                <SectionGroup className="footprint" title={t`Footprint`}>
                  <Footprint product={selectedResult} lat={lat} lng={lng} />
                </SectionGroup>
              </div>
            </div>
          </div>
        </div>
        {/* <ProductInfo
          onClose={onClose}
          product={selectedResult}
          downloadInProgress={downloadInProgress}
          onDownload={() => {
            onDownload();
            onClose();
          }}
        /> */}
      </>
    </Rodal>
  );
};

const mapStoreToProps = (store) => ({
  selectedResult: store.searchResults.selectedResult,
  selectedLanguage: store.language.selectedLanguage,
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  previewImageUrl: store.modal.params.previewImageUrl,
});

export default connect(mapStoreToProps, null)(RRDProductInfoModal);
