import React from 'react';
import Toggle from 'react-toggle';
import { t } from 'ttag';
import { CheckboxGroup, Checkbox } from 'react-checkbox-group';

import { RESOLUTION_DIVISORS, IMAGE_FORMATS, IMAGE_FORMATS_INFO, RESOLUTION_OPTIONS } from './consts';
import { isTiff } from './ImageDownload.utils';
import ExternalLink from '../../ExternalLink/ExternalLink';
import Loader from '../../Loader/Loader';

export const CUSTOM_TAG = ' Custom';

export default class AnalyticalForm extends React.PureComponent {
  CAPTIONS_TITLE = t`File will have logo attached.`;
  DATAMASK_TITLE = t`A dataMask-band will be included in the downloaded raw bands as second band.`;
  TIFF_BANDS_SELECTION = t`The Tagged Image File Format (TIFF) can hold a large number of bands, however many common image viewers (e.g. Windows Photo Viewer) can't display TIFF images with more than 3 bands.\nIf this option is enabled, only the first 3 bands will be included in the image.\nIf this option is disabled, all bands will be included in the image, but you will have to use an application which supports more than 3 bands (e.g. QGIS) to display the TIFF image.`;

  componentDidUpdate(prevProps) {
    if (prevProps.imageFormat !== this.props.imageFormat) {
      const JPGandPNG = [IMAGE_FORMATS.JPG, IMAGE_FORMATS.PNG];
      if (JPGandPNG.includes(prevProps.imageFormat) && !JPGandPNG.includes(this.props.imageFormat)) {
        if (this.props.showLogo) {
          // Logo can only be applied to PNG and JPG
          this.props.updateFormData('showLogo', false);
        }
        this.props.updateFormData('addDataMask', false);
      } else if (!JPGandPNG.includes(prevProps.imageFormat) && JPGandPNG.includes(this.props.imageFormat)) {
        this.props.updateFormData('addDataMask', true);
      }
    }
  }

  render() {
    const {
      imageFormat,
      selectedResolution,
      selectedCrs,
      allLayers,
      allBands,
      showLogo,
      renderImageSize,
      areImageDimensionsValid,
      updateFormData,
      renderCRSResolution,
      onErrorMessage,
      isCurrentLayerCustom,
      customSelected,
      selectedLayers,
      selectedBands,
      updateSelectedLayers,
      updateSelectedBands,
      supportedImageFormats,
      addDataMask,
      allowShowLogoAnalytical,
      clipExtraBandsTiff,
      customResolution,
      getCrsOptions,
    } = this.props;

    const isJPGorPNG = imageFormat === IMAGE_FORMATS.JPG || imageFormat === IMAGE_FORMATS.PNG;

    if (allLayers.length === 0) {
      return <Loader />;
    }

    return (
      <div className="analytical-mode">
        {allowShowLogoAnalytical && isJPGorPNG && (
          <div className="form-field">
            <label title={this.CAPTIONS_TITLE}>
              {t`Show logo`}
              <i
                className="fa fa-info-circle"
                onClick={() => {
                  onErrorMessage(this.CAPTIONS_TITLE);
                }}
              />
            </label>
            <div className="form-input">
              <Toggle
                checked={showLogo}
                icons={false}
                onChange={() => updateFormData('showLogo', !showLogo)}
              />
            </div>
          </div>
        )}
        <div className="row">
          <label>{t`Image format`}:</label>
          <select
            className="dropdown"
            value={imageFormat}
            onChange={(e) => updateFormData('imageFormat', e.target.value)}
          >
            {supportedImageFormats.map((format) => (
              <option key={IMAGE_FORMATS_INFO[format].text} value={format}>
                {IMAGE_FORMATS_INFO[format].text}
              </option>
            ))}
          </select>
        </div>
        <div className="row">
          <label>{t`Image resolution`}:</label>
          <div>
            <select
              className="dropdown"
              value={selectedResolution}
              onChange={(ev) => updateFormData('selectedResolution', ev.target.value)}
            >
              {Object.keys(RESOLUTION_DIVISORS).map((key) => (
                <option key={RESOLUTION_DIVISORS[key].text} value={key}>
                  {RESOLUTION_DIVISORS[key].text}
                </option>
              ))}
            </select>
            <small className={!areImageDimensionsValid ? 'error' : ''}>
              {renderImageSize(selectedResolution)}
            </small>
            {!areImageDimensionsValid && (
              <small className="error">
                {' ' + t`Image width and height must be between 1px and 2500px`}
              </small>
            )}
          </div>
        </div>
        {selectedResolution === RESOLUTION_OPTIONS.CUSTOM && (
          <>
            <div className="row">
              <label>{t`Resolution X (m/px)` + ':'}</label>
              <input
                min={0}
                type={'number'}
                value={customResolution[0]}
                onChange={(ev) => updateFormData('customResolution', [ev.target.value, customResolution[1]])}
              ></input>
            </div>
            <div className="row">
              <label>{t`Resolution Y (m/px)` + ':'}</label>
              <input
                min={0}
                type={'number'}
                value={customResolution[1]}
                onChange={(ev) => updateFormData('customResolution', [customResolution[0], ev.target.value])}
              ></input>
            </div>
          </>
        )}
        <div className="row">
          <label>{t`Coordinate system` + ':'}</label>

          <div>
            <select
              className="dropdown"
              value={selectedCrs}
              onChange={(ev) => updateFormData('selectedCrs', ev.target.value)}
            >
              {getCrsOptions().map((obj) => (
                <option key={obj.text} value={obj.id}>
                  {obj.text}
                </option>
              ))}
            </select>
            <small>
              {selectedResolution === RESOLUTION_OPTIONS.CUSTOM
                ? null
                : renderCRSResolution(selectedResolution, selectedCrs)}
            </small>
          </div>
        </div>
        {selectedBands.length > 0 && !isJPGorPNG && (
          <div className="form-field">
            <label title={this.DATAMASK_TITLE}>
              {t`Add dataMask band to raw layers`}
              <ExternalLink href="https://docs.sentinel-hub.com/api/latest/user-guides/datamask/">
                <i className="fa fa-info-circle" />
              </ExternalLink>
            </label>
            <div className="form-input">
              <Toggle
                checked={addDataMask}
                icons={false}
                onChange={() => updateFormData('addDataMask', !addDataMask)}
              />
            </div>
          </div>
        )}
        {(customSelected || selectedLayers.length > 0) && isTiff(imageFormat) && (
          <div className="form-field">
            <label>
              {t`Clip extra bands`}
              <i
                className="fa fa-info-circle"
                onClick={() => {
                  onErrorMessage(this.TIFF_BANDS_SELECTION);
                }}
              />
            </label>
            <div className="form-input">
              <Toggle
                checked={clipExtraBandsTiff}
                icons={false}
                onChange={() => updateFormData('clipExtraBandsTiff', !clipExtraBandsTiff)}
              />
            </div>
          </div>
        )}
        <div className="row">
          <label>{t`Layers`}:</label>
          <div className="download-layers">
            <div className="column">
              <span className="layer-title">{t`Visualized`}</span>
              <CheckboxGroup name="layers" value={selectedLayers} onChange={updateSelectedLayers}>
                {isCurrentLayerCustom && (
                  <label key={CUSTOM_TAG}>
                    <Checkbox value={CUSTOM_TAG} checked={customSelected} />
                    {CUSTOM_TAG}
                  </label>
                )}
                {allLayers.map((l) => (
                  <label key={l.layerId}>
                    <Checkbox value={l.layerId} /> {l.title}
                  </label>
                ))}
              </CheckboxGroup>
            </div>
            <div className="column">
              <span className="layer-title">{t`Raw`}</span>
              <CheckboxGroup value={selectedBands} onChange={updateSelectedBands}>
                {allBands.map((l) => (
                  <label key={l.name}>
                    <Checkbox value={l.name} /> {l.name}
                  </label>
                ))}
              </CheckboxGroup>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
