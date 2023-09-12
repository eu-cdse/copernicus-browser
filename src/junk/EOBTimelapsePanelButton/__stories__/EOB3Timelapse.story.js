import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import { requestAuthToken } from '@sentinel-hub/sentinelhub-js';
import { Provider } from 'react-redux';

import store from '../../../store';
import { EOB3TimelapsePanel } from '../../EOB3TimelapsePanel/EOB3TimelapsePanel';
import { EOBTimelapsePanelButton } from '../EOBTimelapsePanelButton';
const stories = storiesOf('EOB3 Timelapse', module);

let authToken = null;
async function getAuthTokenForOAuthCredentials() {
  if (!authToken) {
    const clientId = process.env.REACT_APP_CLIENTID;
    const clientSecret = process.env.REACT_APP_ANONYMOUS_AUTH_CLIENT_ID;
    authToken = await requestAuthToken(clientId, clientSecret);
  }
}
getAuthTokenForOAuthCredentials();

const effects = { gainEffect: 2, gammaEffect: 2 };

stories.add('Timelapse EFFECTS (proba-v)', ({ state, setState }) => {
  return (
    <Provider store={store}>
      <EOBTimelapsePanelButton
        selectedResult={selectedResult}
        isCompareMode={false}
        isLoggedIn={true}
        openTimelapsePanel={() => setState({ openTimelapsePanel: true })}
        onErrorMessage={(msg) => setState({ errorMsg: msg })}
      />
      {state.openTimelapsePanel && (
        <EOB3TimelapsePanel
          onClose={() => setState({ openTimelapsePanel: false })}
          selectedResult={selectedResultProbaV}
          canWeFilterByClouds={false}
          minDate={new Date('2016-01-01')}
          maxDate={new Date()}
          evalscriptoverrides={''}
          effects={effects}
          isEvalUrl={false}
          lat={41.9}
          lng={12.5}
          zoom={10}
          mapBounds={mapBounds}
          aoiBounds={undefined}
          cloudCoverageLayers={cloudCoverageLayers}
          presets={presets}
          instances={instancesProbaV}
          onFetchAvailableDates={mockEveryDay}
          onGetAndSetNextPrev={onGetAndSetNextPrev}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          overlayLayers={[]}
          authToken={authToken}
        />
      )}
    </Provider>
  );
});

function mockEveryDay(fromDate, toDate, boundsGeojson) {
  const ISO_8601_UTC = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
  const STANDARD_STRING_DATE_FORMAT = 'YYYY-MM-DD';
  const dates = [];
  let d = moment(fromDate.format(ISO_8601_UTC));

  for (let i = 0; d.isBefore(moment(toDate)); i++) {
    dates.push(d.format(STANDARD_STRING_DATE_FORMAT));
    d = d.add(1, 'day');
  }

  return new Promise((resolve) => {
    resolve(dates);
  });
}

function onGetAndSetNextPrev(direction) {
  console.log('Log: onGetAndSetNextPrev -> direction', direction);
}

function onQueryDatesForActiveMonth(date) {
  console.log('Log: onQueryDatesForActiveMonth -> date', date);
  return new Promise((resolve) => {
    resolve([moment(date).startOf('month').format('YYYY-MM-DD')]);
  });
}

const selectedResultProbaV = {
  name: 'Proba-V 1-day (S1)',
  id: 'PROBAV_S1',
  group: 'PROBAV',
  baseUrls: { WMS: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows' },
  customLayer: false,
  zoomToTile: false,
  effects: false,
  search: {
    tooltip: 'Global archive from 2013/10 onward',
    label: '1-day (S1)',
    preselected: true,
    searchableByArea: false,
  },
  minZoom: 1,
  maxZoom: 16,
  allowOverZoomBy: 0,
  showPrevNextDate: true,
  timespanSupported: false,
  preset: 'PROBAV_S1_TOA_333M',
  datasource: 'Proba-V 1-day (S1)',
  time: '2020-02-26',
  sensingTime: '00:00:00 UTC',
  cloudCoverage: -1,
  activeLayer: {
    name: 'Proba-V 1-day (S1)',
    id: 'PROBAV_S1',
    group: 'PROBAV',
    baseUrls: { WMS: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows' },
    customLayer: false,
    zoomToTile: false,
    effects: false,
    search: {
      tooltip: 'Global archive from 2013/10 onward',
      label: '1-day (S1)',
      preselected: true,
      searchableByArea: false,
    },
    minZoom: 1,
    maxZoom: 16,
    allowOverZoomBy: 0,
    showPrevNextDate: true,
    timespanSupported: false,
  },
  lat: 56.506,
  lng: 12.826999999999998,
  fetchingFunctionIndex: 0,
  handlerIndex: 7,
  evalscript: 'cmV0dXJuIFtdOw==',
  layers: null,
};

const instancesProbaV = [
  {
    name: 'Proba-V 1-day (S1)',
    id: 'PROBAV_S1',
    group: 'PROBAV',
    baseUrls: { WMS: 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows' },
    customLayer: false,
    zoomToTile: false,
    effects: false,
    search: {
      tooltip: 'Global archive from 2013/10 onward',
      label: '1-day (S1)',
      preselected: true,
      searchableByArea: false,
    },
    minZoom: 1,
    maxZoom: 16,
    allowOverZoomBy: 0,
    showPrevNextDate: true,
    timespanSupported: false,
  },
];

const cloudCoverageLayers = {
  'Sentinel-2 L2A': {
    id: '__CLOUD_COVERAGE',
    name: '__CLOUD_COVERAGE',
    description: '',
    dataset: 'S2L2A',
    image:
      'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=__CLOUD_COVERAGE&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2019-11-25',
    legendDefinitionJsonUrl: null,
  },
};

const selectedResult = {
  name: 'Sentinel-2 L1C',
  baseUrls: {
    WMS: 'https://services.sentinel-hub.com/ogc/wms/cd2801-YOUR-INSTANCEID-HERE',
  },
  minDate: undefined,
  maxDate: undefined,
  time: '2019-11-07',
  getDates: {},
};

const mapBounds = {
  _southWest: {
    lat: 41.47771800887873,
    lng: 11.759490966796875,
  },
  _northEast: {
    lat: 42.32098569864824,
    lng: 13.242645263671877,
  },
};

const presets = {
  'Proba-V 1-day (S1)': [
    {
      name: 'PROBAV_S1_TOA_333M',
      id: 'PROBAV_S1_TOA_333M',
      description:
        'PROBA-V daily Synthesis\nTop of Atmosphere\ntemporal resolution: daily\nResolution: 333M (pixel size)\n',
      image:
        'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows&SERVICE=WMS&REQUEST=GetMap&show&LAYERS=PROBAV_S1_TOA_333M&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE71&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2020-02-27',
    },
  ],
};
