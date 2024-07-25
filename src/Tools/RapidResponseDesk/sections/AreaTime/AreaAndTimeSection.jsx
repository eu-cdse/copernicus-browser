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
import Slider from 'rc-slider';
import { t } from 'ttag';
import store, { areaAndTimeSectionSlice } from '../../../../store';

const AreaAndTimeSection = ({ areaTimeExpanded, aoiGeometry, aoiIsDrawing, mapBounds, aoiCoverage }) => {
  const updateSliderValue = (value) => {
    store.dispatch(areaAndTimeSectionSlice.actions.setAoiCoverage(value));
  };

  const getTitle = () => <div className="uppercase-text">{AreaAndTimeSectionProperties.title()}</div>;

  const getBody = () => (
    <div className="area-time-body">
      <div className="area-interest-container">
        <AOISelection
          aoiGeometry={aoiGeometry}
          aoiIsDrawing={aoiIsDrawing}
          mapBounds={mapBounds}
        ></AOISelection>
        <div className="coverage-slider-container">
          <label className="aoi-label-text">{`${t`AOI coverage`}:`}</label>
          <Slider
            className="aoi-slider"
            min={0}
            max={1}
            step={0.01}
            value={aoiCoverage}
            onChange={updateSliderValue}
          />
          <span className="aoi-current-value-text">{`${Math.round(aoiCoverage * 100)}%`}</span>
          <span></span>
        </div>
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
  aoiCoverage: store.areaAndTimeSection.aoiCoverage,
  aoiIsDrawing: store.aoi.isDrawing,
  mapBounds: store.mainMap.bounds,
});

export default connect(mapStoreToProps, null)(AreaAndTimeSection);
