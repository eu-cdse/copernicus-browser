import React from 'react';
import './ProviderSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { ProviderSectionProperties } from '../../CommercialData.utils';

const ProviderSection = ({ providerExpanded }) => {
  //TODO: Custom Header
  return (
    <CollapsiblePanel
      key={ProviderSectionProperties.id}
      className={`section ${providerExpanded ? 'active' : 'inactive'}`}
      title={ProviderSectionProperties.title()}
      headerComponent={ProviderSectionProperties.title()}
      expanded={providerExpanded}
      toggleExpanded={ProviderSectionProperties.toggleExpanded}
    >
      {() => {
        return providerExpanded ? <div>Provider content</div> : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  providerExpanded: store.collapsiblePanel.providerExpanded,
});

export default connect(mapStoreToProps, null)(ProviderSection);
