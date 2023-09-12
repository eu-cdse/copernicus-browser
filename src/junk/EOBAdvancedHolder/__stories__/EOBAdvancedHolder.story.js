import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import { DndProvider } from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';

import EOBAdvancedHolder from '../EOBAdvancedHolder';
import './storybook.scss';

const stories = storiesOf('EOB - AdvancedHolder', module);

stories.add('Default', ({ state, setState }) => {
  const viewValue = state.viewValue || 2;
  const onDataFusionChange = (dataFusion) => setState({ dataFusion: dataFusion });

  return (
    <DndProvider options={HTML5toTouch}>
      <div className="eob-advanced-holder-outer">
        <EOBAdvancedHolder
          views={views}
          currView={viewValue}
          channels={channels}
          evalscripturl={''}
          evalscript={'cmV0dXJuIFtCMDEqMi41LEIwMioyLjUsQjAzKjIuNV07'}
          dataFusion={state.dataFusion}
          layers={{
            r: 'B01',
            g: 'B02',
            b: 'B03',
          }}
          activeLayer={activeLayer}
          initialTimespan={'2020-04-23T00:00:00Z/2020-04-23T23:59:59Z'}
          isEvalUrl={false}
          style={undefined}
          onUpdateScript={() => setState({ onUpdateScript: true })}
          onDataFusionChange={onDataFusionChange}
          onBack={() => setState({ onBack: true })}
          onCodeMirrorRefresh={() => setState({ onCodeMirrorRefresh: true })}
          onCompositeChange={() => setState({ onCompositeChange: true })}
          onIndexScriptChange={() => setState({ onIndexScriptChange: true })}
        />
      </div>
    </DndProvider>
  );
});

const views = {
  PRESETS: 1,
  BANDS: 2,
  SCRIPT: 3,
};

const activeLayer = {
  name: 'Sentinel-2 L1C',
  id: 'S2L1C',
  group: 'SENTINEL-2',
  evalsource: 'S2',
  baseUrls: {
    WMS: 'https://services.sentinel-hub.com/ogc/wms/cd2801-YOUR-INSTANCEID-HERE',
    FIS: 'https://services.sentinel-hub.com/ogc/fis/cd2801-YOUR-INSTANCEID-HERE',
  },
  search: {
    tooltip: 'Global archive from 2016/07 onward',
    label: 'L1C',
    preselected: true,
    searchableByArea: true,
  },
  typename: 'S2.TILE',
  minDate: '2015-01-01',
  shortName: 'L1C',
  siblingDatasourceId: 'S2L2A',
  previewPrefix: 'https://roda.sentinel-hub.com/sentinel-s2-l1c',
  awsLink: 'http://sentinel-s2-l1c.s3-website.eu-central-1.amazonaws.com/',
  indexService: 'https://services.sentinel-hub.com/index/v3/collections/S2L1C/searchIndex',
  resolution: 10,
  minZoom: 5,
  maxZoom: 16,
  allowOverZoomBy: 2,
};

const channels = [
  {
    name: 'B01',
    description: 'Band 1 - Coastal aerosol - 443 nm ',
    color: '#4c17e2',
  },
  {
    name: 'B02',
    description: 'Band 2 - Blue - 490 nm ',
    color: '#699aff',
  },
  {
    name: 'B03',
    description: 'Band 3 - Green - 560 nm ',
    color: '#a4d26f',
  },
  {
    name: 'B04',
    description: 'Band 4 - Red - 665 nm ',
    color: '#e47121',
  },
  {
    name: 'B05',
    description: 'Band 5 - Vegetation Red Edge - 705 nm',
    color: '#ba0a0a',
  },
  {
    name: 'B06',
    description: 'Band 6 - Vegetation Red Edge - 740 nm',
    color: '#cc1412',
  },
  {
    name: 'B07',
    description: 'Band 7 - Vegetation Red Edge - 783 nm',
    color: '#c00607',
  },
  {
    name: 'B08',
    description: 'Band 8 - NIR - 842 nm',
    color: '#c31e20',
  },
  {
    name: 'B09',
    description: 'Band 9 - Water vapour - 945 nm',
    color: '#b31a1b',
  },
  {
    name: 'B10',
    description: 'Band 10 - SWIR - Cirrus - 1375 nm',
    color: '#d71234',
  },
  {
    name: 'B11',
    description: 'Band 11 - SWIR - 1610 nm',
    color: '#990134',
  },
  {
    name: 'B12',
    description: 'Band 12 - SWIR - 2190 nm',
    color: '#800000',
  },
  {
    name: 'B8A',
    description: 'Band 8A - Vegetation Red Edge - 865 nm',
    color: '#bc0e10',
  },
];
