import React from 'react';
import Toggle from 'react-toggle';
import { t } from 'ttag';

import InputWithBouncyLimit from '../../components/InputWithBouncyLimit/InputWithBouncyLimit';
import { IMAGE_FORMATS, IMAGE_FORMATS_INFO } from './consts';

export default class BasicForm extends React.Component {
  CAPTIONS_TITLE = t`Exported image(s) will include datasource and date, zoom scale and branding`;
  DESCRIPTION_TITLE = t`Add a short description to the exported image`;
  CAPTIONS_DISABLED_LOGGED_OUT_TITLE = t`You need to login to use this functionality.`;

  render() {
    const {
      showCaptions,
      updateFormData,
      showLegend,
      userDescription,
      hasLegendData,
      onErrorMessage,
      imageFormat,
      width,
      height,
      heightToWidthRatio,
      isUserLoggedIn,
    } = this.props;
    return (
      <div>
        <div className={`form-field ${isUserLoggedIn ? '' : 'disabled'}`}>
          <label title={isUserLoggedIn ? this.CAPTIONS_TITLE : this.CAPTIONS_DISABLED_LOGGED_OUT_TITLE}>
            {t`Show captions`}
            <i
              className="fa fa-info-circle"
              onClick={() => {
                onErrorMessage(
                  isUserLoggedIn ? this.CAPTIONS_TITLE : this.CAPTIONS_DISABLED_LOGGED_OUT_TITLE,
                );
              }}
            />
          </label>
          <div className="form-input">
            <Toggle
              checked={showCaptions}
              icons={false}
              onChange={() => updateFormData('showCaptions', !showCaptions)}
            />
          </div>
        </div>
        {hasLegendData && (
          <div className="form-field">
            <label title={t`Show legend`}>
              {t`Show legend`}
              <i
                className="fa fa-info-circle"
                onClick={() => {
                  onErrorMessage(t`Exported image will include legend`);
                }}
              />
            </label>
            <div className="form-input">
              <Toggle
                checked={showLegend}
                icons={false}
                onChange={() => updateFormData('showLegend', !showLegend)}
              />
            </div>
          </div>
        )}
        {showCaptions && (
          <div className="form-field">
            <label title={this.DESCRIPTION_TITLE}>
              {t`Description`}
              <i
                className="fa fa-info-circle"
                onClick={() => {
                  onErrorMessage(this.DESCRIPTION_TITLE);
                }}
              />
            </label>
            <div className="form-input">
              <input
                className="full-width"
                value={userDescription}
                onChange={(ev) => updateFormData('userDescription', ev.target.value)}
                maxLength="64"
              />
            </div>
          </div>
        )}
        <div className="form-field">
          <label>{t`Image width [px]:`}</label>
          <div className="form-input">
            <InputWithBouncyLimit
              className=""
              type="integer"
              min={50}
              max={10000}
              step={1}
              value={width}
              setValue={(newWidth) => {
                updateFormData('width', newWidth);
                updateFormData('height', Math.round(heightToWidthRatio * newWidth));
              }}
            />
          </div>
        </div>

        <div className="form-field">
          <label>{t`Image height [px]:`}</label>
          <div className="form-input">
            <input className="" type="number" disabled value={height} />
          </div>
        </div>
        <div className="form-field">
          <label>{t`Image format:`}</label>
          <div className="form-input">
            <select
              className="dropdown"
              value={imageFormat}
              onChange={(e) => updateFormData('imageFormat', e.target.value)}
            >
              <option value={IMAGE_FORMATS.JPG}>{IMAGE_FORMATS_INFO[IMAGE_FORMATS.JPG].text}</option>
              <option value={IMAGE_FORMATS.PNG}>{IMAGE_FORMATS_INFO[IMAGE_FORMATS.PNG].text}</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
}
