import React from 'react';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { connect } from 'react-redux';
import store, { collapsiblePanelSlice } from '../../../../store';
import { t } from 'ttag';
import './ProjectDetailsSection.scss';

const ProjectDetailsSectionAttributes = Object.freeze({
  id: 'project-name',
  name: () => t`Project`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setprojectDetailsExpanded(v)),
});

const ProjectDetailsSection = ({ currentProjectName, projectDetailsExpanded }) => {
  const getName = () => <div className="uppercase-text">{ProjectDetailsSectionAttributes.name()}:</div>;

  const renderBody = () => (
    <div className="project-body">
      <div className="project-name">{currentProjectName}</div>
    </div>
  );

  return (
    <CollapsiblePanel
      key={ProjectDetailsSectionAttributes.id}
      className="section"
      name={getName()}
      title={getName()}
      headerComponent={getName()}
      expanded={projectDetailsExpanded}
      toggleExpanded={ProjectDetailsSectionAttributes.toggleExpanded}
    >
      {() => {
        return projectDetailsExpanded ? renderBody() : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  currentProjectName: store.themes.currentProjectName,
  projectDetailsExpanded: store.collapsiblePanel.projectDetailsExpanded,
});

export default connect(mapStoreToProps, null)(ProjectDetailsSection);
