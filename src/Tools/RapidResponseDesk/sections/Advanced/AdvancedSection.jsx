import React from 'react';
import './AdvancedSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { AdvancedSectionProperties } from '../../CommercialData.utils';

const AdvancedSection = ({ advancedExpanded }) => {
  return (
    <CollapsiblePanel
      key={AdvancedSectionProperties.id}
      className={`section ${advancedExpanded ? 'active' : 'inactive'}`}
      title={AdvancedSectionProperties.title()}
      headerComponent={AdvancedSectionProperties.title()}
      expanded={advancedExpanded}
      toggleExpanded={AdvancedSectionProperties.toggleExpanded}
    >
      {() => {
        return advancedExpanded ? <div>Advanced content</div> : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  advancedExpanded: store.collapsiblePanel.advancedExpanded,
});

export default connect(mapStoreToProps, null)(AdvancedSection);
