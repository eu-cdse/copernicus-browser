import React from 'react';
import { t } from 'ttag';

import BasicForm from './BasicForm';

class PrintForm extends React.Component {
  OVERLAY_TITLE = t`The map's overlay layers (place labels, streets and political boundaries) will be added to the image.`;
  CAPTIONS_TITLE = t`Exported image(s) will include datasource and date, zoom scale and branding`;
  DESCRIPTION_TITLE = t`Add a short description to the exported image`;

  render() {
    const {
      showCaptions,
      updateFormData,
      showLegend,
      userDescription,
      hasLegendData,
      imageWidthInches,
      resolutionDpi,
      imageFormat,
      onErrorMessage,
      heightToWidthRatio,
      isUserLoggedIn,
    } = this.props;

    const imageHeightInches = (imageWidthInches * heightToWidthRatio).toFixed(1);

    return (
      <div>
        <BasicForm
          showCaptions={showCaptions}
          showLegend={showLegend}
          userDescription={userDescription}
          hasLegendData={hasLegendData}
          onErrorMessage={onErrorMessage}
          imageFormat={imageFormat}
          updateFormData={updateFormData}
          addingMapOverlaysPossible={false}
          isUserLoggedIn={isUserLoggedIn}
        />

        <div className="form-field">
          <label>{t`Image width [inches]:`}</label>
          <div className="form-input">
            <input
              className=""
              type="number"
              min={1}
              max={80}
              step={0.1}
              value={imageWidthInches}
              onChange={(ev) => {
                updateFormData('imageWidthInches', ev.target.value);
              }}
            />
          </div>
        </div>

        <div className="form-field">
          <label>{t`Image height [inches]:`}</label>
          <div className="form-input">
            <input
              className=""
              type="number"
              min={1}
              max={80}
              step={0.1}
              disabled
              value={imageHeightInches}
            />
          </div>
        </div>

        <div className="form-field">
          <label>{t`DPI:`}</label>
          <div className="form-input">
            <input
              className=""
              type="number"
              min={150}
              max={600}
              step={50}
              value={resolutionDpi}
              onChange={(ev) => updateFormData('resolutionDpi', ev.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PrintForm;
