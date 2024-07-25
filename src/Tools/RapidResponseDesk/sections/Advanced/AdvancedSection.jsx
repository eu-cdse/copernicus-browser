import React from 'react';
import './AdvancedSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { AdvancedSectionProperties } from '../../RapidResponseDesk.utils';

const AdvancedSection = ({ advancedExpanded }) => {
  const getTitle = () => <div className="uppercase-text">{AdvancedSectionProperties.title()}</div>;

  return (
    <CollapsiblePanel
      key={AdvancedSectionProperties.id}
      className={`section ${advancedExpanded ? 'active' : 'inactive'}`}
      title={getTitle()}
      headerComponent={getTitle()}
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
  selectedLanguage: store.language.selectedLanguage,
  advancedExpanded: store.collapsiblePanel.advancedExpanded,
});

export default connect(mapStoreToProps, null)(AdvancedSection);
