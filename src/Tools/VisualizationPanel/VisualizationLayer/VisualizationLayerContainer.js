import React, { useState } from 'react';
import { t } from 'ttag';
import { connect } from 'react-redux';

import LayerSelection from '../LayerSelection';

import { CUSTOM_VISUALIZATION_URL_ROUTES } from '../../../junk/EOBAdvancedHolder/EOBAdvancedHolder';

function VisualizationLayerContainer({
  savePin,
  displayEffects,
  customSelected,
  toggleLayerActions,
  layerActionsOpen,
}) {
  const [locationHash, setLocationHash] = useState(window.location.hash);

  function onBackToLayerList() {
    setLocationHash('');
  }

  return (
    <div className="layer-selection">
      <div className="layer-header">
        <div className="layer-title">{t`Layers`}:</div>
        {customSelected && CUSTOM_VISUALIZATION_URL_ROUTES.includes(locationHash) && (
          /* eslint-disable-next-line */
          <a onClick={onBackToLayerList} className="eob-btn primary">
            <i className="fa fa-arrow-left" />
            {t`Back`}
          </a>
        )}
      </div>

      <LayerSelection
        savePin={savePin}
        displayEffects={displayEffects}
        locationHash={locationHash}
        setLocationHash={setLocationHash}
        onBackToLayerList={onBackToLayerList}
        toggleLayerActions={toggleLayerActions}
        layerActionsOpen={layerActionsOpen}
      />
    </div>
  );
}

const mapStoreToProps = (store) => ({
  customSelected: store.visualization.customSelected,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(VisualizationLayerContainer);
