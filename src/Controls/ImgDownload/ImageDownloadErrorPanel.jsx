import React, { useEffect, useState } from 'react';
import { t } from 'ttag';

import { constructErrorMessage } from '../../utils';

function ImageDownloadErrorPanel(props) {
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!props.error) {
      return;
    }
    constructErrorMessage(props.error).then((message) => setErrorMessage(message));
  }, [props.error]);

  if (!props.error || !errorMessage) {
    return null;
  }

  return (
    <div className="image-download-error-panel">
      <div className="image-download-error-header">
        <i className="fa fa-exclamation-circle" />
        {t`An error has occurred while fetching some of the images:`}
      </div>
      <div className="textarea-wrapper">
        <pre className="error-container">{errorMessage}</pre>
      </div>
    </div>
  );
}

export default ImageDownloadErrorPanel;
