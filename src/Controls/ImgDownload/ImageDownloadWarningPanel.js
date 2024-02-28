import React from 'react';
import { t } from 'ttag';

import ExternalLink from '../../ExternalLink/ExternalLink';

export const WARNINGS = {
  NO_EVALSCRIPT: 'no-evalscript',
  PARSING_UNSUCCESSFUL: 'parsing-unsuccessful',
};

export function ImageDownloadWarningPanel(props) {
  const { warnings } = props;
  if (!warnings) {
    return null;
  }

  return (
    <div className="image-download-warning-panel">
      {warnings[WARNINGS.NO_EVALSCRIPT] ? (
        <div>
          <i className="fa fa-warning" />
          {t`Warning: Following layers use dataProducts, so the desired data type might not be set:`}
          <div>
            <ul>
              {warnings[WARNINGS.NO_EVALSCRIPT].map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      {warnings[WARNINGS.PARSING_UNSUCCESSFUL] ? (
        <div>
          <i className="fa fa-warning" />
          {t`Warning: Evalscript is not in a typical V3 format and the desired data type could not be set for:`}
          <div>
            <ul>
              {warnings[WARNINGS.PARSING_UNSUCCESSFUL].map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      <div>
        {t`This means "sampleType" parameter is likely set to default (AUTO). You can fix this by editing your evalscript. Learn more about "sampleType" in the documentation`}
        :{' '}
        <ExternalLink href="https://docs.sentinel-hub.com/api/latest/evalscript/v3/#sampletype">
          <i className="fas fa-external-link-alt" />
        </ExternalLink>
      </div>
    </div>
  );
}
