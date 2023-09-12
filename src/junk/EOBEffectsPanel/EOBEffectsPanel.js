import React from 'react';
import { connect } from 'react-redux';
import { Interpolator } from '@sentinel-hub/sentinelhub-js';

import { t } from 'ttag';
import 'react-toggle/style.css';

import EffectDropdown from './EffectDropdown';
import EffectSlider from './EffectSlider';
import RGBEffects from './RGBEffects';
import SpeckleFilter from './SpeckleFilter';

import './EOBEffectsPanel.scss';

import { BACK_COEF_OPTIONS, defaultEffects, DEM_3D_SOURCES, ORTHORECTIFICATION_OPTIONS } from '../../const';
import { visualizationSlice } from '../../store';
import { getValueOrDefault, getDatasetDefaults } from '../../utils/effectsUtils';
import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import ExternalLink from '../../ExternalLink/ExternalLink';
import { getMosaickingOrderOptions } from '../../utils/mosaickingOrder.utils';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const supportedInterpolations = [Interpolator.BILINEAR, Interpolator.BICUBIC, Interpolator.NEAREST];

const IS_3D_DEM_SOURCE_ENABLED = false;

function renderMinQaSlider({ effects, onUpdateMinQa }) {
  return (
    <EffectSlider
      key="minQa"
      name={t`Min. data quality`}
      min={0}
      max={100}
      step={1}
      value={getValueOrDefault(effects, 'minQa', defaultEffects)}
      onChange={onUpdateMinQa}
      useLogScale={false}
    />
  );
}

function renderInterpolationSelection({ effects, onUpdateUpsampling, onUpdateDownsampling }) {
  const interpolationOptions = [
    {
      name: t`Upsampling`,
      value: getValueOrDefault(effects, 'upsampling', defaultEffects),
      onChange: onUpdateUpsampling,
    },
    {
      name: t`Downsampling`,
      value: getValueOrDefault(effects, 'downsampling', defaultEffects),
      onChange: onUpdateDownsampling,
    },
  ];
  return interpolationOptions.map((interpolationOption) => (
    <EffectDropdown
      key={interpolationOption.name}
      name={interpolationOption.name}
      value={interpolationOption.value}
      onChange={interpolationOption.onChange}
      options={supportedInterpolations.map((interpolation) => ({
        value: interpolation,
        label: interpolation,
      }))}
    />
  ));
}

function renderOrthorectificationSelection({ effects, onUpdateOrthorectification }) {
  return (
    <EffectDropdown
      name={t`Orthorectification`}
      value={getValueOrDefault(effects, 'orthorectification', defaultEffects)}
      onChange={onUpdateOrthorectification}
      options={Object.keys(ORTHORECTIFICATION_OPTIONS).map((option) => ({
        value: option,
        label: ORTHORECTIFICATION_OPTIONS[option],
      }))}
      tooltip={
        <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
          {t`Orthorectification creates a planimetrically correct image. Specify the DEM used for Orthorectification process here.`}
          <br />
          <br />
          <ExternalLink href="https://docs.sentinel-hub.com/api/latest/data/sentinel-1-grd/#processing-options">
            {t`More information`}
          </ExternalLink>
        </HelpTooltip>
      }
    />
  );
}

function renderBackscatterCoeffSelection({ effects, onUpdateBackscatterCoeff }) {
  return (
    <EffectDropdown
      name={t`Backscatter coefficient`}
      value={getValueOrDefault(effects, 'backscatterCoeff', defaultEffects)}
      onChange={onUpdateBackscatterCoeff}
      options={Object.keys(BACK_COEF_OPTIONS).map((option) => ({
        value: option,
        label: BACK_COEF_OPTIONS[option],
      }))}
      tooltip={
        <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
          {t`Measurement values returned will be in the chosen backscatter coefficient. Radiometric terrain correction can be enabled by setting the Backscatter coefficient to gamma0_terrain; in this case orthorectification will be enabled using the DEM selected under Orthorectification.`}
          <br />
          <br />
          <ExternalLink href="https://docs.sentinel-hub.com/api/latest/data/sentinel-1-grd/#processing-options">
            {t`More information`}
          </ExternalLink>
        </HelpTooltip>
      }
    />
  );
}

function renderSpeckleFilterSelection({ effects, onUpdateSpeckleFilter, datasetId, zoom }) {
  const { canApplySpeckleFilter, supportedSpeckleFilters } = getDatasetDefaults({
    datasetId: datasetId,
    zoom: zoom,
  });
  return (
    <SpeckleFilter
      speckleFilter={getValueOrDefault(effects, 'speckleFilter', defaultEffects)}
      canApplySpeckleFilter={canApplySpeckleFilter}
      supportedSpeckleFilters={supportedSpeckleFilters}
      onUpdateSpeckleFilter={onUpdateSpeckleFilter}
    />
  );
}

function renderProcessingParameters(props) {
  const {
    doesDatasetSupportSpeckleFilter,
    doesDatasetSupportOrthorectification,
    doesDatasetSupportBackscatterCoeff,
  } = getDatasetDefaults(props);

  return (
    <React.Fragment key="processingParameters">
      <div className="title">{t`Processing parameters`}</div>
      {doesDatasetSupportSpeckleFilter && renderSpeckleFilterSelection(props)}
      {doesDatasetSupportOrthorectification && renderOrthorectificationSelection(props)}
      {doesDatasetSupportBackscatterCoeff && renderBackscatterCoeffSelection(props)}
      <hr />
    </React.Fragment>
  );
}

function render3DDemSourceSelection(props) {
  const { effects, onUpdateDemSource3D } = props;

  return (
    <React.Fragment key="demSource3D">
      <EffectDropdown
        name={t`DEM source`}
        value={getValueOrDefault(effects, 'demSource3D', defaultEffects)}
        onChange={onUpdateDemSource3D}
        options={Object.keys(DEM_3D_SOURCES).map((option) => ({
          value: option,
          label: DEM_3D_SOURCES[option],
        }))}
        displayLayerDefault={false}
      />
    </React.Fragment>
  );
}

function renderCommonEffects(props) {
  const dsh = getDataSourceHandler(props.datasetId);
  const hasCloudCoverage = dsh && dsh.tilesHaveCloudCoverage(props.datasetId);
  return (
    <React.Fragment key="commonEffects">
      <EffectSlider
        key={'gain'}
        name={t`Gain`}
        min={0.01}
        max={100}
        step={0.01}
        value={getValueOrDefault(props.effects, 'gainEffect', defaultEffects)}
        onChange={props.onUpdateGainEffect}
      />
      <EffectSlider
        key={'gamma'}
        name={t`Gamma`}
        min={0.1}
        max={10}
        step={0.01}
        value={getValueOrDefault(props.effects, 'gammaEffect', defaultEffects)}
        onChange={props.onUpdateGammaEffect}
      />
      <RGBEffects key="rgbEffects" {...props} />
      <EffectDropdown
        key="mosaickingOrder"
        name={t`Mosaicking order`}
        value={getValueOrDefault(props.effects, 'mosaickingOrder', defaultEffects)}
        onChange={props.onUpdateMosaickingOrder}
        options={getMosaickingOrderOptions(props.datasetId, hasCloudCoverage)}
        displayLayerDefault={true}
      />
    </React.Fragment>
  );
}

const getEffectsList = (props) => {
  const {
    doesDatasetSupportSpeckleFilter,
    doesDatasetSupportOrthorectification,
    doesDatasetSupportBackscatterCoeff,
    doesDatasetSupportInterpolation,
    doesDatasetSupportMinQa,
  } = getDatasetDefaults(props);

  return [
    {
      shouldRender:
        doesDatasetSupportSpeckleFilter ||
        doesDatasetSupportOrthorectification ||
        doesDatasetSupportBackscatterCoeff,
      render: () => renderProcessingParameters(props),
    },
    {
      shouldRender: true,
      render: () => renderCommonEffects(props),
    },
    { shouldRender: doesDatasetSupportMinQa, render: () => renderMinQaSlider(props) },
    {
      shouldRender: doesDatasetSupportInterpolation,
      render: () => renderInterpolationSelection(props),
    },
    {
      shouldRender: IS_3D_DEM_SOURCE_ENABLED && props.is3D,
      render: () => render3DDemSourceSelection(props),
    },
  ];
};

const EOBEffectsPanel = (props) => {
  const { onResetEffects } = props;

  return (
    <div className="effects-panel">
      <div className="effects-header">
        <div>{t`Effects and advanced options`}</div>
      </div>

      {getEffectsList(props)
        .filter((e) => !!e.shouldRender)
        .map((e) => e.render())}

      <div className="effects-footer" title={t`Reset all`}>
        <div className="action" onClick={onResetEffects}>{t`Reset all`}</div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    onUpdateGainEffect: (gain) => dispatch(visualizationSlice.actions.setGainEffect(parseFloat(gain))),
    onUpdateGammaEffect: (gamma) => dispatch(visualizationSlice.actions.setGammaEffect(parseFloat(gamma))),
    onUpdateRedRangeEffect: (range) => dispatch(visualizationSlice.actions.setRedRangeEffect(range)),
    onUpdateGreenRangeEffect: (range) => dispatch(visualizationSlice.actions.setGreenRangeEffect(range)),
    onUpdateBlueRangeEffect: (range) => dispatch(visualizationSlice.actions.setBlueRangeEffect(range)),
    onUpdateRedCurveEffect: (curve) => dispatch(visualizationSlice.actions.setRedCurveEffect(curve)),
    onUpdateGreenCurveEffect: (curve) => dispatch(visualizationSlice.actions.setGreenCurveEffect(curve)),
    onUpdateBlueCurveEffect: (curve) => dispatch(visualizationSlice.actions.setBlueCurveEffect(curve)),
    onUpdateMinQa: (x) => dispatch(visualizationSlice.actions.setMinQa(parseInt(x))),
    onUpdateUpsampling: (x) => dispatch(visualizationSlice.actions.setUpsampling(x ? x : undefined)),
    onUpdateDownsampling: (x) => dispatch(visualizationSlice.actions.setDownsampling(x ? x : undefined)),
    onUpdateSpeckleFilter: (x) => dispatch(visualizationSlice.actions.setSpeckleFilter(x ? x : undefined)),
    onUpdateOrthorectification: (x) =>
      dispatch(visualizationSlice.actions.setOrthorectification(x ? x : undefined)),
    onUpdateBackscatterCoeff: (x) =>
      dispatch(visualizationSlice.actions.setBackScatterCoeff(x ? x : undefined)),
    onResetEffects: () => dispatch(visualizationSlice.actions.resetEffects()),
    onResetRgbEffects: () => dispatch(visualizationSlice.actions.resetRgbEffects()),
    onUpdateDemSource3D: (x) => dispatch(visualizationSlice.actions.setDemSource3D(x ? x : undefined)),
    onUpdateMosaickingOrder: (mosaickingOrder) =>
      dispatch(visualizationSlice.actions.setMosaickingOrder(mosaickingOrder ? mosaickingOrder : undefined)),
  };
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
  datasetId: store.visualization.datasetId,
  zoom: store.mainMap.zoom,
  customSelected: store.visualization.customSelected,
  selectedLanguage: store.language.selectedLanguage,
  selectedVisualizationId: store.visualization.layerId,
  visualizationUrl: store.visualization.visualizationUrl,
  selectedThemeId: store.themes.selectedThemeId,
  selectedModeId: store.themes.selectedModeId,
  is3D: store.mainMap.is3D,
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
});

export default connect(mapStoreToProps, mapDispatchToProps)(EOBEffectsPanel);
