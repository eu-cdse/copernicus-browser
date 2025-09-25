import React from 'react';
import { t, gettext } from 'ttag';

import { md5 } from 'js-md5';
import previews from '../../../previews.json';
import CodeIcon from './code.svg?react';
import DoubleChevronDown from '../../../icons/double-chevron-down.svg?react';
import DoubleChevronUp from '../../../icons/double-chevron-up.svg?react';
import { isOpenEoSupported } from '../../../api/openEO/openEOHelpers';

const EMPTY_IMAGE_DATA_URI = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const getIconSrc = (selectedThemeId, viz, datasetId) => {
  const { instanceId, url } = viz;
  const urlHash = instanceId ? instanceId.substr(0, 6) : md5(url).substr(0, 8);
  let layerId = viz.layerId;

  const filename = `${selectedThemeId}-${urlHash}-${layerId}.png`;

  if (!previews.includes(filename)) {
    return EMPTY_IMAGE_DATA_URI;
  }
  return `${import.meta.env.VITE_ROOT_URL}previews/${filename}`;
};

const getTranslatedDynamicString = (x) => {
  // we are using dynamic strings (fetched from SH service) to call gettext(), which causes
  // `npm run translate` to break unless we disable ttag within this block:
  /* disable ttag */
  // empty string gets translated to .po file information, so we must guard against it here:
  if (!x) {
    return '';
  }
  return gettext(x);
};

const LayerHeader = ({
  selectedThemeId,
  datasetId,
  viz,
  title,
  shortDescription,
  isActive,
  hasEvalScript,
  hasDetails,
  setEvalScriptAndCustomVisualization,
  detailsOpen,
  toggleDetails,
  actionsOpen,
  toggleActions,
  onClick,
}) => {
  const supportsOpenEO = isOpenEoSupported(viz.instanceId, viz.layerId);
  return (
    <div className="layer-header" onClick={onClick}>
      <div className="preview">
        <img
          className="icon"
          crossOrigin="Anonymous"
          src={getIconSrc(selectedThemeId, viz, datasetId)}
          alt=""
        />
      </div>
      <div className="title">
        <span className={`${isActive ? 'active-title' : ''}`}>{getTranslatedDynamicString(title)}</span>
        <small className={`${isActive ? 'active-description' : ''}`}>
          {getTranslatedDynamicString(shortDescription)}
        </small>
      </div>
      {isActive && (
        <div className="icons">
          <div title={t`Add to`} className={`plus ${actionsOpen ? 'active' : ''}`} onClick={toggleActions}>
            <i className={`fas ${actionsOpen ? 'fa-minus' : 'fa-plus'}`}></i> {t`Add to`}
          </div>

          {(hasEvalScript || supportsOpenEO) && (
            <div title={t`Show custom option`} className="code-icon-wrapper">
              <CodeIcon
                className="code"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.hash = '#custom-script'; // open accordion option for evalscript
                  setEvalScriptAndCustomVisualization(viz.layerId);
                }}
              />
            </div>
          )}
          {detailsOpen ? (
            <DoubleChevronUp
              className={`double-chevron-up ${hasDetails ? '' : 'disabled'}`}
              title={t`Hide details`}
              onClick={toggleDetails}
            />
          ) : (
            <DoubleChevronDown
              className={`double-chevron-down ${hasDetails ? '' : 'disabled'}`}
              title={t`Show details`}
              onClick={toggleDetails}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LayerHeader;
