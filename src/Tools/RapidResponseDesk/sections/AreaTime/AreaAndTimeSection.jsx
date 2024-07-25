import React from 'react';
import './AreaAndTimeSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { AreaAndTimeSectionProperties } from '../../CommercialData.utils';

const AreaAndTimeSection = ({ areaTimeExpanded }) => {
  return (
    <CollapsiblePanel
      key={AreaAndTimeSectionProperties.id}
      className={`section ${areaTimeExpanded ? 'active' : 'inactive'}`}
      title={AreaAndTimeSectionProperties.title()}
      headerComponent={AreaAndTimeSectionProperties.title()}
      expanded={areaTimeExpanded}
      toggleExpanded={AreaAndTimeSectionProperties.toggleExpanded}
    >
      {() => {
        return areaTimeExpanded ? <div>Area and time content</div> : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  areaTimeExpanded: store.collapsiblePanel.areaTimeExpanded,
});

export default connect(mapStoreToProps, null)(AreaAndTimeSection);
