import React from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import VisualizationLayer from './VisualizationLayer/VisualizationLayer';

const Visualizations = (props) => {
  const { visualizations, supportsCustom, setCustomVisualization, customSelected } = props;

  if (!visualizations) {
    return null;
  }

  return (
    <>
      {visualizations.map((viz, i) => (
        <VisualizationLayer layer={viz} key={i} {...props} />
      ))}
      {!supportsCustom ? null : (
        <div
          onClick={setCustomVisualization}
          className={customSelected ? 'layer-container active' : 'layer-container'}
        >
          <div className="layer-header">
            <div className="preview-custom">
              <i className="icon fa fa-paint-brush fa-lg" />
            </div>
            <div className="title">
              {t`Custom`}
              <small>{t`Create custom visualisation`}</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const mapStoreToProps = (store) => ({
  customSelected: store.visualization.customSelected,
  datasetId: store.visualization.datasetId,
  selectedThemeId: store.themes.selectedThemeId,
  selectedModeId: store.themes.selectedModeId,
  selectedLanguage: store.language.selectedLanguage,
  toTime: store.visualization.toTime,
});

export default connect(mapStoreToProps, null)(Visualizations);
