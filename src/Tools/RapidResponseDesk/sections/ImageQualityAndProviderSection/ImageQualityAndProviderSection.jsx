import React, { useCallback, useEffect, useState } from 'react';
import './ImageQualityAndProviderSection.scss';
import { connect } from 'react-redux';
import { t } from 'ttag';
import Slider from 'rc-slider/lib/Slider';

import store, { collapsiblePanelSlice, imageQualityAndProviderSectionSlice } from '../../../../store';
import RadioButtonGroup from '../../../../components/RadioButtonGroup/RadioButtonGroup';
import { Range } from 'rc-slider';
import Optical from './Optical/Optical';
import Radar from './Radar/Radar';
import Atmos from './Atmos/Atmos';
import {
  ProviderImageOptions,
  ProviderImageTypes,
  ResolutionSliderMarks,
  ProviderModeSupport,
} from '../../rapidResponseProperties';
import { RRD_RESOLUTION_CLASSES } from '../../../../api/RRD/assets/rrd.utils';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';

const ProviderSectionAttributes = Object.freeze({
  id: 'provider',
  title: () => t`Provider`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setProviderExpanded(v)),
});

const ImageQualityAndProviderSection = ({
  providerExpanded,
  imageType,
  imageResolution,
  isTaskingEnabled,
}) => {
  const [sliderValue, setSliderValue] = useState(imageResolution);
  const headerOptions = ProviderImageOptions.map((option) => ({
    ...option,
    disabled: !option.searchModes.includes(
      isTaskingEnabled ? ProviderModeSupport.tasking : ProviderModeSupport.archive,
    ),
  }));

  const setImageType = (value) => {
    switch (value) {
      case ProviderImageTypes.optical:
        store.dispatch(imageQualityAndProviderSectionSlice.actions.resetAtmosSection());
        store.dispatch(imageQualityAndProviderSectionSlice.actions.resetRadarSection());
        break;
      case ProviderImageTypes.radar:
        store.dispatch(imageQualityAndProviderSectionSlice.actions.resetAtmosSection());
        store.dispatch(imageQualityAndProviderSectionSlice.actions.resetOpticalSection());
        break;
      case ProviderImageTypes.atmos:
        store.dispatch(imageQualityAndProviderSectionSlice.actions.resetOpticalSection());
        store.dispatch(imageQualityAndProviderSectionSlice.actions.resetRadarSection());

        break;
      default:
        break;
    }

    store.dispatch(imageQualityAndProviderSectionSlice.actions.setImageType(value));
  };

  const renderHeader = () => (
    <div className="radio-buttons-container">
      <RadioButtonGroup
        name="image-quality-and-provider-header-radio-group"
        options={headerOptions}
        value={headerOptions.find((type) => type.value === imageType)}
        onChange={setImageType}
      ></RadioButtonGroup>
    </div>
  );

  const snapToSupportedValue = (val) => {
    const supportedValues = Object.keys(ResolutionSliderMarks).map(Number);
    return supportedValues.reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev,
    );
  };

  const onResolutionChange = (value) => {
    if (isTaskingEnabled || !doBothRangeSliderEndsReachMinOrMaxOfSlider(value)) {
      let newValue;
      if (Array.isArray(value)) {
        const first = isTaskingEnabled
          ? Math.max(10, snapToSupportedValue(value[0]))
          : snapToSupportedValue(value[0]);
        let second = snapToSupportedValue(value[1]);
        if (second <= first) {
          const supported = Object.keys(ResolutionSliderMarks)
            .map(Number)
            .sort((a, b) => a - b);
          const next = supported.find((v) => v > first);
          second = next || first;
        }
        newValue = [first, second];
      } else {
        newValue = Math.max(10, snapToSupportedValue(value));
      }
      setSliderValue(newValue);
      store.dispatch(imageQualityAndProviderSectionSlice.actions.setImageResolution(newValue));
    }
  };

  const doBothRangeSliderEndsReachMinOrMaxOfSlider = (value) => {
    const minOfInnerHandle = 1;
    const maxOfInnerHandle = 99;
    return value.at(-1) === minOfInnerHandle || value.at(0) === maxOfInnerHandle;
  };

  const getResolutionText = () => {
    const displayedSliderValue = getSliderValueForDisplay(sliderValue);
    if (isTaskingEnabled) {
      return `${RRD_RESOLUTION_CLASSES[displayedSliderValue]}`;
    } else {
      return `${ResolutionSliderMarks[displayedSliderValue[0]].value}–${
        ResolutionSliderMarks[displayedSliderValue.at(-1)].value
      }m`;
    }
  };

  const getSliderValueForDisplay = useCallback(
    (sliderVal) => {
      if (isTaskingEnabled) {
        return Array.isArray(sliderVal) ? sliderVal.at(-1) : sliderVal;
      } else {
        return Array.isArray(sliderVal) ? sliderVal : [0, sliderVal];
      }
    },
    [isTaskingEnabled],
  );

  const renderResolutionSlider = () => {
    const sliderClass = `resolution-slider ${isTaskingEnabled ? 'tasking' : ''}`;
    return (
      <div className="resolution-container">
        <label className="resolution-label">{t`Resolution`}:</label>
        <div className={sliderClass}>
          <Slider
            value={getSliderValueForDisplay(sliderValue)}
            min={0}
            max={100}
            marks={ResolutionSliderMarks}
            step={null}
            defaultValue={Array.isArray(imageResolution) ? imageResolution.at(-1) : imageResolution}
            onChange={onResolutionChange}
          >
            <div id="slider-section-container">
              <div className="slider-section border">
                <span>VHR1</span>
              </div>
              <div className="slider-section">
                <span>VHR2</span>
              </div>
              <div className="slider-section border">
                <span>HR1</span>
              </div>
              <div className="slider-section">
                <span>HR2</span>
              </div>
              <div className="slider-section border">
                <span>MR1</span>
              </div>
            </div>
          </Slider>
        </div>
        <span className="resolution-current-value-text">{getResolutionText()}</span>
      </div>
    );
  };

  const renderResolutionRange = () => {
    return (
      <div className="resolution-container">
        <label className="resolution-label">{t`Resolution`}:</label>
        <div className="resolution-slider">
          <Range
            range
            value={getSliderValueForDisplay(sliderValue)}
            min={0}
            max={100}
            marks={ResolutionSliderMarks}
            step={null}
            allowCross={false}
            pushable
            onChange={onResolutionChange}
          >
            <div id="slider-section-container">
              <div className="slider-section border">
                <span>VHR1</span>
              </div>
              <div className="slider-section">
                <span>VHR2</span>
              </div>
              <div className="slider-section border">
                <span>HR1</span>
              </div>
              <div className="slider-section">
                <span>HR2</span>
              </div>
              <div className="slider-section border">
                <span>MR1</span>
              </div>
            </div>
          </Range>
        </div>
        <span className="resolution-current-value-text">{getResolutionText()}</span>
      </div>
    );
  };

  const renderBody = () => {
    return (
      <div className="image-quality-and-provider-body">
        {isTaskingEnabled ? renderResolutionSlider() : renderResolutionRange()}
        {imageType === ProviderImageTypes.optical ? (
          <Optical />
        ) : imageType === ProviderImageTypes.radar ? (
          <Radar />
        ) : imageType === ProviderImageTypes.atmos ? (
          <Atmos />
        ) : null}
      </div>
    );
  };

  useEffect(() => {
    let updateValue = getSliderValueForDisplay(imageResolution);
    setSliderValue(updateValue);
    store.dispatch(imageQualityAndProviderSectionSlice.actions.setImageResolution(updateValue));
  }, [isTaskingEnabled, imageResolution, getSliderValueForDisplay]);

  return (
    <CollapsiblePanel
      key={ProviderSectionAttributes.id}
      className={`section`}
      title={renderHeader()}
      headerComponent={renderHeader()}
      expanded={providerExpanded}
      toggleExpanded={ProviderSectionAttributes.toggleExpanded}
    >
      {() => {
        return providerExpanded ? renderBody() : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  providerExpanded: store.collapsiblePanel.providerExpanded,
  imageType: store.imageQualityAndProviderSection.imageType,
  imageResolution: store.imageQualityAndProviderSection.imageResolution,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
});

export default connect(mapStoreToProps, null)(ImageQualityAndProviderSection);
