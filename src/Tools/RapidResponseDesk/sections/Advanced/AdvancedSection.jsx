import React from 'react';
import './AdvancedSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { t } from 'ttag';
import store, { collapsiblePanelSlice, advancedSectionSlice } from '../../../../store';
import Slider, { Range } from 'rc-slider';
import CustomCheckbox, {
  CustomCheckboxLabelPosition,
} from '../../../../components/CustomCheckbox/CustomCheckbox';
import { ADVANCED_PROPERTY_FILTERS, INPUT_TYPES, ProviderModeSupport } from '../../rapidResponseProperties';
import { MultiSelectInput } from '../../../VisualizationPanel/CollectionSelection/AdvancedSearch/filters/MultiSelectInput';

export const AdvancedSectionAttributes = Object.freeze({
  id: 'advanced',
  title: () => t`Advanced`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setAdvancedExpanded(v)),
});

const AdvancedSection = (props) => {
  const getTitle = () => <div className="uppercase-text">{AdvancedSectionAttributes.title()}:</div>;
  const { advancedExpanded, imageType, isTaskingEnabled } = props;

  const advancedSectionBodyComponentProperties = Object.keys(ADVANCED_PROPERTY_FILTERS).map((key) => {
    return {
      ...ADVANCED_PROPERTY_FILTERS[key],
      value: props[ADVANCED_PROPERTY_FILTERS[key].value],
      storeAction: advancedSectionSlice.actions[ADVANCED_PROPERTY_FILTERS[key].storeAction],
    };
  });
  const updateSliderValue = (storeAction) => (value) => {
    store.dispatch(storeAction(value));
  };

  const renderSlider = (item) => {
    return (
      <div className={`slider-container`}>
        <label className="label-text">{item.name}:</label>
        <Slider
          className="slider"
          min={item.min}
          max={item.max}
          step={item.step}
          value={item.value}
          onChange={updateSliderValue(item.storeAction)}
          reverse={true}
        />
        <span className="current-value-text">{`${Math.round(100 - item.value * 100)}%`}</span>
      </div>
    );
  };

  const renderRange = (item) => {
    return (
      <div className={`slider-container`}>
        <label className="label-text">{item.name}:</label>
        <Range
          range
          allowCross={false}
          min={item.min}
          max={item.max}
          marks={item.marks}
          step={item.step}
          value={item.value}
          onChange={updateSliderValue(item.storeAction)}
        />
        <span className="current-value-text">{`${item.value[0]}–${item.value[1]}°`}</span>
      </div>
    );
  };

  const renderCheckBox = (item) => {
    return (
      <div className="checkbox-container">
        <CustomCheckbox
          onChange={() => item.storeAction}
          checked={item.value}
          labelPosition={CustomCheckboxLabelPosition.right}
          label={`${item.name}:`}
        />
      </div>
    );
  };

  const renderMultiSelectCheckBox = (item) => {
    return (
      <div className="slider-container">
        <label className="label-text">{item.name}:</label>
        <MultiSelectInput
          input={{
            id: `${item.propertyName}`,
            getOptions: () => item.getOption(),
          }}
          titleEnabled={false}
          value={item.value}
          inputStyle={{ minWidth: '40px' }}
          onChange={(value) => store.dispatch(item.storeAction(value))}
        ></MultiSelectInput>
      </div>
    );
  };

  const renderBody = () => {
    return (
      <div className="advanced-section-body">
        {advancedSectionBodyComponentProperties
          .filter((item) => item.sensorType.includes(imageType))
          .filter((item) =>
            item.modeSupport.includes(
              isTaskingEnabled ? ProviderModeSupport.tasking : ProviderModeSupport.archive,
            ),
          )
          .map((item) => (
            <div className="slider-checkbox-container" key={item.name}>
              {item.inputType === INPUT_TYPES.CHECKBOX
                ? renderCheckBox(item)
                : item.inputType === INPUT_TYPES.SLIDER
                ? renderSlider(item)
                : item.inputType === INPUT_TYPES.RANGE_SLIDER
                ? renderRange(item)
                : item.inputType === INPUT_TYPES.MULTI_SELECT_CHECKBOX
                ? renderMultiSelectCheckBox(item)
                : null}
            </div>
          ))}
      </div>
    );
  };

  return (
    <CollapsiblePanel
      key={AdvancedSectionAttributes.id}
      className={`section`}
      title={getTitle()}
      headerComponent={getTitle()}
      expanded={advancedExpanded}
      toggleExpanded={AdvancedSectionAttributes.toggleExpanded}
    >
      {() => {
        return advancedExpanded ? renderBody() : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  advancedExpanded: store.collapsiblePanel.advancedExpanded,
  aoiCoverage: store.advancedSection.aoiCoverage,
  satelliteAzimuth: store.advancedSection.satelliteAzimuth,
  azimuth: store.advancedSection.azimuth,
  sunAzimuth: store.advancedSection.sunAzimuth,
  sunElevation: store.advancedSection.sunElevation,
  imageType: store.imageQualityAndProviderSection.imageType,
  productType: store.advancedSection.productType,
  incidenceAngle: store.advancedSection.incidenceAngle,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
});

export default connect(mapStoreToProps, null)(AdvancedSection);
