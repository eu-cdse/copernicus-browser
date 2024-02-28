import React from 'react';
import { t } from 'ttag';

function VisualizationErrorPanel({ error }) {
  return (
    <div className="visualization-error-panel">
      <div className="visualization-error-header">{t`An error has occurred while fetching images:`}</div>
      <div className="textarea-wrapper">
        <pre className="error-container">{error}</pre>
      </div>
    </div>
  );
}

export default VisualizationErrorPanel;
