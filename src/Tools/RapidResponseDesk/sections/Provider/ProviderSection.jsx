import React from 'react';
import './ProviderSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { ProviderSectionProperties } from '../../RapidResponseDesk.utils';

const ProviderSection = ({ providerExpanded }) => {
  //TODO: Custom Header
  const getTitle = () => <div className="uppercase-text">{ProviderSectionProperties.title()}</div>;

  return (
    <CollapsiblePanel
      key={ProviderSectionProperties.id}
      className={`section ${providerExpanded ? 'active' : 'inactive'}`}
      title={getTitle()}
      headerComponent={getTitle()}
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
