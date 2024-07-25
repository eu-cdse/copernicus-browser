import React from 'react';
import './AreaAndTimeSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { t } from 'ttag';
import store, { collapsiblePanelSlice } from '../../../../store';

export const AreaAndTimeSectionProperties = Object.freeze({
  id: 'area-time',
  title: () => t`Area & Time`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setAreaTimeExpanded(v)),
});
import { AOISelection } from '../../../../components/AOISelection/AOISelection';

const AreaAndTimeSection = ({ areaTimeExpanded, aoiGeometry, aoiIsDrawing, mapBounds }) => {
  const getTitle = () => <div className="uppercase-text">{AreaAndTimeSectionProperties.title()}</div>;

  const getBody = () => (
    <div className="area-time-body">
      <div className="area-interest-container">
        <AOISelection
          aoiGeometry={aoiGeometry}
          aoiIsDrawing={aoiIsDrawing}
          mapBounds={mapBounds}
        ></AOISelection>
      </div>
    </div>
  );

  return (
    <CollapsiblePanel
      key={AreaAndTimeSectionProperties.id}
      className={`section ${areaTimeExpanded ? 'active' : 'inactive'}`}
      title={getTitle()}
      headerComponent={getTitle()}
      expanded={areaTimeExpanded}
      toggleExpanded={AreaAndTimeSectionProperties.toggleExpanded}
    >
      {() => {
        return areaTimeExpanded ? getBody() : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  areaTimeExpanded: store.collapsiblePanel.areaTimeExpanded,
  aoiGeometry: store.aoi.geometry,
  aoiIsDrawing: store.aoi.isDrawing,
  mapBounds: store.mainMap.bounds,
});

export default connect(mapStoreToProps, null)(AreaAndTimeSection);
