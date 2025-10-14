import React from 'react';
import { t } from 'ttag';

import { BandsToRGB } from '../BandsToRGB/BandsToRGB';
import { GroupedBandsToRGB } from '../BandsToRGB/GroupedBandsToRGB';
import { EvalScriptInput } from './EvalScriptInput';
import DataFusion from './DataFusion';
import { IndexBands } from '../BandsToRGB/IndexBands';
import withRouter from '../../hoc/withRouter';

import { getProcessGraph, isOpenEoSupported } from '../../api/openEO/openEOHelpers';
import {
  CodeEditor,
  themeCdasBrowserDark,
  themeCdasBrowserLight,
} from '@sentinel-hub/evalscript-code-editor';
import RadioButtonGroup from '../../components/RadioButtonGroup/RadioButtonGroup';
import { haveEffectsChangedFromDefault } from '../../Tools/VisualizationPanel/VisualizationPanel.utils';

import { PROCESSING_OPTIONS } from '../../const';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';
import store, { visualizationSlice } from '../../store';

import './EOBAdvancedHolder.scss';

const CUSTOM_VISUALISATION_TABS = {
  COMPOSITE_TAB: 0,
  INDEX_TAB: 1,
  CUSTOM_SCRIPT_TAB: 2,
};

export const CUSTOM_VISUALIZATION_URL_ROUTES = ['#custom-composite', '#custom-index', '#custom-script'];

const tutorial =
  'https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Evalscript.html#tutorials-and-other-related-materials';
const repo = 'https://custom-scripts.sentinel-hub.com/';
const getEvalscriptTooltipContent = () => t`
An evalscript (or "custom script") is a piece of Javascript code that defines how the satellite data
should be processed by Sentinel Hub (one of the underlying services that powers the Browser) and what values the
service should return. \n\n
Read more about custom scripts in our [tutorials](${tutorial}) or use already prepared scripts
for different collections from the [custom script repository](${repo}).
`;

const processGraphUrl = 'https://documentation.dataspace.copernicus.eu/APIs/openEO/Glossary.html#processes';
const getProcessGraphTooltipContent = () => t`
An OpenEO process graph is a chain of processes that defines how satellite data should be processed by the synchronous OpenEO API (one of the underlying services that powers the Browser) and what values the service should return. \n\n
Read more about processes and process graphs [here](${processGraphUrl}).
`;
const getUnsupportedProcessGraphTooltipContent = () => t`
OpenEO process graph is currently not supported for this collection.

An OpenEO process graph is a chain of processes that defines how satellite data should be processed by the synchronous OpenEO API (one of the underlying services that powers the Browser) and what values the service should return. \n\n
Read more about processes and process graphs [here](${processGraphUrl}).
`;

class EOBAdvancedHolder extends React.Component {
  state = {
    selectedTab: null,
  };

  initTabs = () => {
    const hashIndex = CUSTOM_VISUALIZATION_URL_ROUTES.findIndex((hash) =>
      this.props.router.location.hash.includes(hash),
    );
    if (hashIndex !== -1) {
      this.setState({ selectedTab: hashIndex });
    }
  };

  componentDidMount() {
    if (this.props.router.location.hash) {
      this.initTabs();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.router.location.hash !== prevProps.router.location.hash) {
      this.initTabs();
    }
  }

  setSelectedTab(index) {
    this.setState({ selectedTab: index });
    window.location.hash = CUSTOM_VISUALIZATION_URL_ROUTES[index];
  }

  render() {
    const { selectedTab } = this.state;
    const {
      channels,
      layers,
      evalscript,
      evalscripturl,
      dataFusion = [],
      activeLayer: activeDatasource,
      initialTimespan,
      isEvalUrl,
      indexLayers,
      onUpdateScript,
      onDataFusionChange,
      onEvalscriptRefresh,
      onCompositeChange,
      onIndexScriptChange,
      areBandsClasses,
      supportsIndex,
      style,
      selectedVisualizationId,
      visualizationUrl,
      selectedProcessing,
      effects,
    } = this.props;

    const groupedChannels =
      activeDatasource && activeDatasource.datasetId && activeDatasource.groupChannels
        ? activeDatasource.groupChannels(activeDatasource.datasetId)
        : null;

    const haveEffectsChanged = haveEffectsChangedFromDefault(effects);
    const supportsOpenEO = isOpenEoSupported(
      visualizationUrl,
      selectedVisualizationId,
      IMAGE_FORMATS.PNG,
      haveEffectsChanged,
    );
    const customProcessingOptions = [
      {
        label: t`OpenEO process graph`,
        value: PROCESSING_OPTIONS.OPENEO,
        className: 'radio-button-label',
        disabled: !supportsOpenEO,
        getTooltipContent: supportsOpenEO
          ? getProcessGraphTooltipContent
          : getUnsupportedProcessGraphTooltipContent,
        title: !supportsOpenEO
          ? t`OpenEO process graph is currently not supported for this collection.`
          : undefined,
      },
      {
        label: t`Custom script`,
        value: PROCESSING_OPTIONS.PROCESS_API,
        className: 'radio-button-label',
        disabled: false,
        getTooltipContent: getEvalscriptTooltipContent,
      },
    ];

    return layers && channels ? (
      <div className="advancedPanel" style={style}>
        <div className="custom-visualisation-content">
          <ul className="custom-visualisation-tabs">
            <li
              className={`tab-button ${
                selectedTab === CUSTOM_VISUALISATION_TABS.COMPOSITE_TAB ? `active` : ``
              }`}
              onClick={() => this.setSelectedTab(CUSTOM_VISUALISATION_TABS.COMPOSITE_TAB)}
            >{t`Composite`}</li>
            <li
              className={`tab-button ${selectedTab === CUSTOM_VISUALISATION_TABS.INDEX_TAB ? `active` : ``}`}
              onClick={() => this.setSelectedTab(CUSTOM_VISUALISATION_TABS.INDEX_TAB)}
            >{t`Index`}</li>
            <li
              className={`tab-button ${
                selectedTab === CUSTOM_VISUALISATION_TABS.CUSTOM_SCRIPT_TAB ? `active` : ``
              }`}
              onClick={() => this.setSelectedTab(CUSTOM_VISUALISATION_TABS.CUSTOM_SCRIPT_TAB)}
            >{t`Custom`}</li>
          </ul>

          {selectedTab === CUSTOM_VISUALISATION_TABS.COMPOSITE_TAB && (
            <div className="custom-visualisation-wrapper">
              {groupedChannels ? (
                <GroupedBandsToRGB
                  groupedBands={groupedChannels}
                  value={layers}
                  onChange={onCompositeChange}
                />
              ) : (
                <BandsToRGB
                  bands={channels}
                  value={layers}
                  onChange={onCompositeChange}
                  areBandsClasses={areBandsClasses}
                  datasetId={activeDatasource.datasetId}
                />
              )}
            </div>
          )}

          {selectedTab === CUSTOM_VISUALISATION_TABS.INDEX_TAB && supportsIndex && (
            <div className="custom-visualisation-wrapper">
              <IndexBands
                bands={channels}
                layers={indexLayers}
                onChange={onIndexScriptChange}
                evalscript={evalscript}
                datasetId={activeDatasource.datasetId}
              />
            </div>
          )}

          {selectedTab === CUSTOM_VISUALISATION_TABS.CUSTOM_SCRIPT_TAB && (
            <div className="custom-visualisation-wrapper" key={selectedProcessing}>
              <RadioButtonGroup
                value={customProcessingOptions.find((opt) => opt.value === selectedProcessing)}
                options={customProcessingOptions}
                onChange={(val) => {
                  store.dispatch(
                    visualizationSlice.actions.setVisualizationParams({ selectedProcessing: val }),
                  );
                }}
              />
              {selectedProcessing === PROCESSING_OPTIONS.PROCESS_API && activeDatasource && (
                <DataFusion
                  key={activeDatasource.baseUrls.WMS}
                  baseUrlWms={activeDatasource.baseUrls.WMS}
                  settings={dataFusion}
                  onChange={onDataFusionChange}
                  initialTimespan={initialTimespan}
                />
              )}
              {selectedProcessing === PROCESSING_OPTIONS.OPENEO ? (
                <div className="evalscript-input">
                  <div className="code-editor-wrap">
                    <CodeEditor
                      themeDark={themeCdasBrowserDark}
                      themeLight={themeCdasBrowserLight}
                      defaultEditorTheme="light"
                      value={JSON.stringify(
                        getProcessGraph(visualizationUrl, selectedVisualizationId),
                        null,
                        '\t',
                      )}
                      onChange={() => {}}
                      portalId="code_editor_portal"
                      zIndex={9999}
                      isReadOnly={true}
                      isEditable={false}
                      language="json"
                    />
                  </div>
                </div>
              ) : (
                <EvalScriptInput
                  onRefreshEvalscript={onEvalscriptRefresh}
                  evalscript={evalscript}
                  evalscripturl={window.decodeURIComponent(evalscripturl || '')}
                  isEvalUrl={isEvalUrl}
                  onChange={onUpdateScript}
                />
              )}
            </div>
          )}
        </div>
      </div>
    ) : (
      <div />
    );
  }
}

export default withRouter(EOBAdvancedHolder);
