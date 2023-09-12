/* eslint-disable */
import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import { requestAuthToken } from '@sentinel-hub/sentinelhub-js';
import { Provider } from 'react-redux';

import store from '../../../store';
import { EOBTimelapsePanelButton } from '../EOBTimelapsePanelButton';
import { EOB3TimelapsePanel as EOBTimelapsePanel } from '../../EOB3TimelapsePanel/EOB3TimelapsePanel';

const stories = storiesOf('EOB - Panel - Timelapse', module);

let authToken = null;
async function getAuthTokenForOAuthCredentials() {
  if (!authToken) {
    const clientId = process.env.STORYBOOK_CLIENT_ID;
    const clientSecret = process.env.STORYBOOK_CLIENT_SECRET;
    authToken = await requestAuthToken(clientId, clientSecret);
  }
}
getAuthTokenForOAuthCredentials();

stories
  .add('Default - Button', ({ state, setState }) => {
    return (
      <EOBTimelapsePanelButton
        selectedResult={selectedResult}
        isCompareMode={false}
        isLoggedIn={true}
        openTimelapsePanel={() => setState({ openTimelapsePanel: true })}
        onErrorMessage={(msg) => setState({ errorMsg: msg })}
      />
    );
  })
  .add('Timelapse', ({ state, setState }) => {
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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultS1}
            canWeFilterByClouds={false}
            minDate={new Date('2019-10-23')}
            maxDate={new Date('2019-11-23')}
            evalscriptoverrides={''}
            isEvalUrl={false}
            lat={41.9}
            lng={12.5}
            zoom={10}
            mapBounds={mapBounds}
            aoiBounds={undefined}
            cloudCoverageLayers={cloudCoverageLayers}
            presets={presets}
            instances={instancesS1}
            onFetchAvailableDates={onFetchAvailableDates}
            onGetAndSetNextPrev={onGetAndSetNextPrev}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            overlayLayers={[]}
            authToken={authToken}
            effects={{}}
          />
        )}
      </Provider>
    );
  })
  .add('Timelapse with borders', ({ state, setState }) => {
    const overlayLayers = [{ name: 'Borders', layer: borders }];

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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultS1}
            canWeFilterByClouds={false}
            minDate={new Date('2019-10-23')}
            maxDate={new Date('2019-11-23')}
            evalscriptoverrides={''}
            isEvalUrl={false}
            lat={41.9}
            lng={12.5}
            zoom={10}
            mapBounds={mapBounds}
            aoiBounds={undefined}
            cloudCoverageLayers={cloudCoverageLayers}
            presets={presets}
            instances={instancesS1}
            onFetchAvailableDates={onFetchAvailableDates}
            onGetAndSetNextPrev={onGetAndSetNextPrev}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            overlayLayers={overlayLayers}
            authToken={authToken}
            effects={{}}
          />
        )}
      </Provider>
    );
  })
  .add('Timelapse with 2 overlay layers', ({ state, setState }) => {
    const overlayLayers = [
      { name: 'Borders', layer: borders },
      { name: 'Labels', layer: labels },
    ];

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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultS1}
            canWeFilterByClouds={false}
            minDate={new Date('2019-10-23')}
            maxDate={new Date('2019-11-23')}
            evalscriptoverrides={''}
            isEvalUrl={false}
            lat={41.9}
            lng={12.5}
            zoom={10}
            mapBounds={mapBounds}
            aoiBounds={undefined}
            cloudCoverageLayers={cloudCoverageLayers}
            presets={presets}
            instances={instancesS1}
            onFetchAvailableDates={onFetchAvailableDates}
            onGetAndSetNextPrev={onGetAndSetNextPrev}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            overlayLayers={overlayLayers}
            authToken={authToken}
            effects={{}}
          />
        )}
      </Provider>
    );
  })
  .add('6 months timelapse for S2L2A with cloud coverage', ({ state, setState }) => {
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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultS2L2A}
            canWeFilterByClouds={true}
            minDate={new Date('2016-01-01')}
            maxDate={new Date()}
            evalscriptoverrides={''}
            isEvalUrl={false}
            lat={68.2611438405758}
            lng={178.154296875}
            zoom={7}
            mapBounds={mapBoundsMorePassesPerDay}
            aoiBounds={undefined}
            cloudCoverageLayers={cloudCoverageLayers}
            presets={presets}
            instances={instancesS2L2A}
            onFetchAvailableDates={mockHalfYear2019}
            onGetAndSetNextPrev={onGetAndSetNextPrev}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            overlayLayers={[]}
            authToken={authToken}
            effects={{}}
          />
        )}
      </Provider>
    );
  })
  .add('6 months timelapse for S3 OLCI with cloud coverage', ({ state, setState }) => {
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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultS3OLCI}
            canWeFilterByClouds={true}
            minDate={new Date('2016-01-01')}
            maxDate={new Date()}
            evalscriptoverrides={''}
            isEvalUrl={false}
            lat={41.9}
            lng={12.5}
            zoom={10}
            mapBounds={mapBounds}
            aoiBounds={undefined}
            cloudCoverageLayers={cloudCoverageLayers}
            presets={presets}
            instances={instancesS3OLCI}
            onFetchAvailableDates={mockHalfYear2019}
            onGetAndSetNextPrev={onGetAndSetNextPrev}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            overlayLayers={[]}
            authToken={authToken}
            effects={{}}
          />
        )}
      </Provider>
    );
  })
  .add(
    'S3 OLCI Error: Each LinearRing of a Polygon must have 4 or more Positions.',
    ({ state, setState }) => {
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
            <EOBTimelapsePanel
              onClose={() => setState({ openTimelapsePanel: false })}
              selectedResult={selectedResultS3OLCI}
              canWeFilterByClouds={true}
              minDate={new Date('2016-01-01')}
              maxDate={new Date()}
              evalscriptoverrides={''}
              isEvalUrl={false}
              lat={0}
              lng={0}
              zoom={8}
              mapBounds={{ _southWest: { lat: -2, lng: -2 }, _northEast: { lat: 2, lng: 2 } }}
              aoiBounds={undefined}
              cloudCoverageLayers={cloudCoverageLayers}
              presets={presets}
              instances={instancesS3OLCI}
              onFetchAvailableDates={mockOneDatePerMonth}
              onGetAndSetNextPrev={onGetAndSetNextPrev}
              onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
              overlayLayers={[]}
              authToken={authToken}
              effects={{}}
            />
          )}
        </Provider>
      );
    },
  )
  .add('S3 OLCI Straight up crashes', ({ state, setState }) => {
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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultS3OLCI}
            canWeFilterByClouds={true}
            minDate={new Date('2016-01-01')}
            maxDate={new Date()}
            evalscriptoverrides={''}
            isEvalUrl={false}
            lat={60}
            lng={0}
            zoom={8}
            mapBounds={{ _southWest: { lat: 59.95, lng: -0.05 }, _northEast: { lat: 61.95, lng: 0.05 } }}
            aoiBounds={undefined}
            cloudCoverageLayers={cloudCoverageLayers}
            presets={presets}
            instances={instancesS3OLCI}
            onFetchAvailableDates={mockHalfYear2019}
            onGetAndSetNextPrev={onGetAndSetNextPrev}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            overlayLayers={[]}
            authToken={authToken}
            effects={{}}
          />
        )}
      </Provider>
    );
  })
  .add('S3 OLCI cxx', ({ state, setState }) => {
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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultS3OLCI}
            canWeFilterByClouds={true}
            minDate={new Date('2016-01-01')}
            maxDate={new Date()}
            evalscriptoverrides={''}
            isEvalUrl={false}
            lat={-18}
            lng={2}
            zoom={8}
            mapBounds={{ _southWest: { lat: -20, lng: 0 }, _northEast: { lat: -16, lng: 4 } }}
            aoiBounds={undefined}
            cloudCoverageLayers={cloudCoverageLayers}
            presets={presets}
            instances={instancesS3OLCI}
            onFetchAvailableDates={mockHalfYear2019}
            onGetAndSetNextPrev={onGetAndSetNextPrev}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            overlayLayers={[]}
            authToken={authToken}
            effects={{}}
          />
        )}
      </Provider>
    );
  })
  .add('Proba-V using legacy functions', ({ state, setState }) => {
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
          <EOBTimelapsePanel
            onClose={() => setState({ openTimelapsePanel: false })}
            selectedResult={selectedResultProbaV}
            canWeFilterByClouds={false}
            minDate={new Date('2016-01-01')}
            maxDate={new Date()}
            evalscriptoverrides={''}
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
            effects={{}}
          />
        )}
      </Provider>
    );
  });

stories.add('Timelapse with 400 dates', ({ state, setState }) => {
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
        <EOBTimelapsePanel
          onClose={() => setState({ openTimelapsePanel: false })}
          selectedResult={selectedResultS1}
          canWeFilterByClouds={false}
          minDate={new Date('2019-10-23')}
          maxDate={new Date('2019-11-23')}
          evalscriptoverrides={''}
          isEvalUrl={false}
          lat={41.9}
          lng={12.5}
          zoom={10}
          mapBounds={mapBounds}
          aoiBounds={undefined}
          cloudCoverageLayers={cloudCoverageLayers}
          presets={presets}
          instances={instancesS1}
          onFetchAvailableDates={mockLotsOfFetchAvailableDates}
          onGetAndSetNextPrev={onGetAndSetNextPrev}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          overlayLayers={[]}
          authToken={authToken}
          effects={{}}
        />
      )}
    </Provider>
  );
});

stories.add('Timelapse - time interval', ({ state, setState }) => {
  const selectedResultTimeInterval = {
    name: 'Sentinel-1 AWS (S1-AWS-IW-VVVH)',
    id: 'S1-AWS-IW-VVVH',
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/bfbfc4-YOUR-INSTANCEID-HERE',
    },
    minZoom: 1,
    wrapCrs: true,
    minDate: '2017-01-01',
    preset: 'ENHANCED-VISUALIZATION',
    evalscripturl: '',
    activeLayer: {
      name: 'Sentinel-1 AWS (S1-AWS-IW-VVVH)',
      id: 'S1-AWS-IW-VVVH',
      baseUrls: {
        WMS: 'https://services.sentinel-hub.com/ogc/wms/bfbfc4-YOUR-INSTANCEID-HERE',
      },
      minZoom: 1,
      wrapCrs: true,
      minDate: '2017-01-01',
    },
    datasource: 'Sentinel-1 AWS (S1-AWS-IW-VVVH)',
    time: '2019-10-01/2019-10-30',
    evalscript: 'cmV0dXJuIFtWVioyLjUsVkgqMi41LEhIKjIuNV07',
    layers: {
      r: 'VV',
      g: 'VH',
      b: 'HH',
    },
  };
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
        <EOBTimelapsePanel
          onClose={() => setState({ openTimelapsePanel: false })}
          selectedResult={selectedResultTimeInterval}
          canWeFilterByClouds={false}
          minDate={new Date('2017-01-01')}
          maxDate={new Date('2020-01-31')}
          evalscriptoverrides={''}
          isEvalUrl={false}
          lat={41.9}
          lng={12.5}
          zoom={10}
          mapBounds={mapBounds}
          aoiBounds={undefined}
          cloudCoverageLayers={cloudCoverageLayers}
          presets={presets}
          instances={instancesS1}
          onFetchAvailableDates={onFetchAvailableDates}
          onGetAndSetNextPrev={onGetAndSetNextPrev}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          overlayLayers={[]}
          authToken={authToken}
          effects={{}}
        />
      )}
    </Provider>
  );
});

stories.add('Timelapse january 2018-2020', ({ state, setState }) => {
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
        <EOBTimelapsePanel
          onClose={() => setState({ openTimelapsePanel: false })}
          selectedResult={{ ...selectedResultS1, time: '2020-01-31' }}
          canWeFilterByClouds={false}
          minDate={new Date('2018-01-01')}
          maxDate={new Date('2020-01-31')}
          evalscriptoverrides={''}
          isEvalUrl={false}
          lat={41.9}
          lng={12.5}
          zoom={10}
          mapBounds={mapBounds}
          aoiBounds={undefined}
          cloudCoverageLayers={cloudCoverageLayers}
          presets={presets}
          instances={instancesS1}
          onFetchAvailableDates={mockOneDatePerMonth}
          onGetAndSetNextPrev={onGetAndSetNextPrev}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          overlayLayers={[]}
          authToken={authToken}
          effects={{}}
        />
      )}
    </Provider>
  );
});

function onFetchAvailableDates(fromDate, toDate, boundsGeojson) {
  // This function mocks call to a service - it returns a set of predefined dates, filtered
  // to suit the specified time range.
  console.log('Log: onFetchAvailableDates -> fromDate', fromDate.format());
  console.log('Log: onFetchAvailableDates -> toDate', toDate.format());
  console.log('Log: onFetchAvailableDates -> boundsGeojson', boundsGeojson);
  const KNOWN_DATES = [
    '2019-10-18',
    '2019-10-21',
    '2019-10-23',
    '2019-10-26',
    '2019-10-28',
    '2019-10-31',
    '2019-11-02',
    '2019-11-05',
    '2019-11-07',
    '2019-11-10',
    '2019-11-12',
    '2019-11-15',
    '2019-11-17',
  ];
  return new Promise((resolve) => {
    const dates = KNOWN_DATES.filter((d) => moment(d).isBetween(fromDate, toDate, null, '[]'));
    resolve(dates);
  });
}

function mockLotsOfFetchAvailableDates(fromDate, toDate, boundsGeojson) {
  const dates = [];
  let d = moment.utc('2019-11-17');
  for (let i = 0; i < 400; i++) {
    dates.push(d.format('YYYY-MM-DD'));
    d = d.add(-1, 'day');
  }
  return new Promise((resolve) => {
    resolve(dates);
  });
}

function mockOneDatePerMonth(fromDate, toDate, boundsGeojson) {
  const ISO_8601_UTC = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
  const STANDARD_STRING_DATE_FORMAT = 'YYYY-MM-DD';
  const dates = [];
  let d = moment(fromDate.format(ISO_8601_UTC));

  for (let i = 0; d.isBefore(moment(toDate)); i++) {
    dates.push(d.format(STANDARD_STRING_DATE_FORMAT));
    d = d.add(1, 'month');
  }

  return new Promise((resolve) => {
    resolve(dates);
  });
}

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

function mockHalfYear2019(fromDate, toDate, boundsGeojson) {
  const KNOWN_DATES = [
    '2019-01-01',
    '2019-01-06',
    '2019-01-11',
    '2019-01-16',
    '2019-01-21',
    '2019-01-26',
    '2019-01-31',
    '2019-02-05',
    '2019-02-10',
    '2019-02-15',
    '2019-02-20',
    '2019-02-25',
    '2019-03-02',
    '2019-03-07',
    '2019-03-12',
    '2019-03-17',
    '2019-03-22',
    '2019-03-27',
    '2019-04-01',
    '2019-04-06',
    '2019-04-11',
    '2019-04-16',
    '2019-04-21',
    '2019-04-26',
    '2019-05-01',
    '2019-05-06',
    '2019-05-11',
    '2019-05-16',
    '2019-05-21',
    '2019-05-26',
    '2019-05-31',
    '2019-06-05',
    '2019-06-10',
    '2019-06-15',
    '2019-06-20',
    '2019-06-25',
    '2019-06-30',
  ];
  return new Promise((resolve) => {
    const dates = KNOWN_DATES.filter((d) => moment(d).isBetween(fromDate, toDate, null, '[]'));
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

const selectedResultS1 = {
  name: 'Sentinel-1 AWS (S1-AWS-IW-VVVH)',
  id: 'S1-AWS-IW-VVVH',
  baseUrls: {
    WMS: 'https://services.sentinel-hub.com/ogc/wms/bfbfc4-YOUR-INSTANCEID-HERE',
  },
  minZoom: 1,
  wrapCrs: true,
  minDate: '2017-01-01',
  preset: 'ENHANCED-VISUALIZATION',
  evalscripturl: '',
  activeLayer: {
    name: 'Sentinel-1 AWS (S1-AWS-IW-VVVH)',
    id: 'S1-AWS-IW-VVVH',
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/bfbfc4-YOUR-INSTANCEID-HERE',
    },
    minZoom: 1,
    wrapCrs: true,
    minDate: '2017-01-01',
  },
  datasource: 'Sentinel-1 AWS (S1-AWS-IW-VVVH)',
  time: '2019-11-23',
  evalscript: 'cmV0dXJuIFtWVioyLjUsVkgqMi41LEhIKjIuNV07',
  layers: {
    r: 'VV',
    g: 'VH',
    b: 'HH',
  },
};

const instancesS1 = [
  {
    name: 'Sentinel-1 AWS (S1-AWS-IW-VVVH)',
    id: 'S1-AWS-IW-VVVH',
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/bfbfc4-YOUR-INSTANCEID-HERE',
    },
    minZoom: 1,
    wrapCrs: true,
    minDate: '2017-01-01',
  },
  {
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/bfbfc449-320a-4a56-b493-61c9d4fc67e',
      FIS: 'https://services.sentinel-hub.com/ogc/fis/bfbfc449-320a-4a56-b493-61c9d4fc67e',
    },
    '@id':
      'https://services.sentinel-hub.com/configuration/v1/wms/instances/bfbfc449-320a-4a56-b493-61c9d4fc67e',
    id: 'bfbfc449-320a-4a56-b493-61c9d4fc67e',
    name: 'My SH Instance ID',
    userId: '6728dc-YOUR-INSTANCEID-HERE',
    additionalData: {
      showWarnings: true,
      showLogo: true,
      imageQuality: 90,
    },
    // layers: {
    //   '@id':
    //     'https://services.sentinel-hub.com/configuration/v1/wms/instances/bfbfc449-320a-4a56-b493-61c9d4fc67e/layers',
    // },
    datasource: 'My SH Instance ID',
  },
];

const selectedResultS2L2A = {
  name: 'Sentinel-2 L2A',
  id: 'S2L2A',
  group: 'SENTINEL-2',
  evalsource: 'S2L2A',
  baseUrls: {
    WMS: 'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE',
    FIS: 'https://services.sentinel-hub.com/ogc/fis/ed64bf-YOUR-INSTANCEID-HERE',
  },
  evalscripturl: '',
  minDate: '2017-03-28',

  preset: '1_TRUE_COLOR',
  activeLayer: {
    name: 'Sentinel-2 L2A',
    id: '1_TRUE_COLOR',
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE',
      FIS: 'https://services.sentinel-hub.com/ogc/fis/ed64bf-YOUR-INSTANCEID-HERE',
    },
    minZoom: 1,
    wrapCrs: true,
    minDate: '2017-01-01',
  },
  datasource: 'Sentinel-2 L2A',
  time: '2019-06-30',
};

const selectedResultS3OLCI = {
  name: 'Sentinel-3 OLCI',
  id: 'S3OLCI',
  group: 'SENTINEL-3',
  evalsource: 'S3OLCI',
  baseUrls: {
    WMS: 'https://services.sentinel-hub.com/ogc/wms/f74cbf-YOUR-INSTANCEID-HERE',
    FIS: 'https://services.sentinel-hub.com/ogc/fis/f74cbf-YOUR-INSTANCEID-HERE',
  },
  search: {
    tooltip: 'Global archive from 2016 onward',
    label: '',
    preselected: false,
    searchableByArea: true,
  },
  typename: 'DSS3.TILE',
  minDate: '2016-02-01',
  previewPrefix: 'https://finder.creodias.eu/files',
  indexService: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/searchIndex',
  resolution: 300,
  maxZoom: 16,
  allowOverZoomBy: 0,
  minZoom: 6,
  preset: '1_TRUE_COLOR',
  evalscripturl: '',
  activeLayer: {
    name: 'Sentinel-3 OLCI',
    id: 'S3OLCI',
    group: 'SENTINEL-3',
    evalsource: 'S3OLCI',
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/f74cbf-YOUR-INSTANCEID-HERE',
      FIS: 'https://services.sentinel-hub.com/ogc/fis/f74cbf-YOUR-INSTANCEID-HERE',
    },
    search: {
      tooltip: 'Global archive from 2016 onward',
      label: '',
      preselected: false,
      searchableByArea: true,
    },
    typename: 'DSS3.TILE',
    minDate: '2016-02-01',
    previewPrefix: 'https://finder.creodias.eu/files',
    indexService: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/searchIndex',
    resolution: 300,
    maxZoom: 16,
    allowOverZoomBy: 0,
    minZoom: 6,
  },
  datasource: 'Sentinel-3 OLCI',
  time: '2020-02-26',
  evalscript: 'cmV0dXJuIFtCMDEqMi41LEIwMioyLjUsQjAzKjIuNV07',
  layers: { r: 'B01', g: 'B02', b: 'B03' },
};

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

const instancesS2L2A = [
  {
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE',
      FIS: 'https://services.sentinel-hub.com/ogc/fis/ed64bf-YOUR-INSTANCEID-HERE',
    },
    '@id':
      'https://services.sentinel-hub.com/configuration/v1/wms/instances/ed64bf-YOUR-INSTANCEID-HERE',
    id: 'ed64bf-YOUR-INSTANCEID-HERE',
    name: 'Sentinel-2 L2A',
    userId: '6728dc-YOUR-INSTANCEID-HERE',
    additionalData: {
      showWarnings: true,
      showLogo: true,
      imageQuality: 90,
    },
    // layers: {
    //   '@id':
    //     'https://services.sentinel-hub.com/configuration/v1/wms/instances/ed64bf-YOUR-INSTANCEID-HERE/layers',
    // },
    datasource: 'Sentinel-2 L2A',
  },
];

const instancesS3OLCI = [
  {
    name: 'Sentinel-3 OLCI',
    id: 'S3OLCI',
    group: 'SENTINEL-3',
    evalsource: 'S3OLCI',
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/f74cbf-YOUR-INSTANCEID-HERE',
      FIS: 'https://services.sentinel-hub.com/ogc/fis/f74cbf-YOUR-INSTANCEID-HERE',
    },
    search: {
      tooltip: 'Global archive from 2016 onward',
      label: '',
      preselected: false,
      searchableByArea: true,
    },
    typename: 'DSS3.TILE',
    minDate: '2016-02-01',
    previewPrefix: 'https://finder.creodias.eu/files',
    indexService: 'https://creodias.sentinel-hub.com/index/v3/collections/S3OLCI/searchIndex',
    resolution: 300,
    maxZoom: 16,
    allowOverZoomBy: 0,
    minZoom: 6,
  },
];

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
  'Landsat 8 USGS': {
    id: '__CLOUD_COVERAGE',
    name: '__CLOUD_COVERAGE',
    description: '',
    dataset: 'L8L1C',
    image:
      'https://services-uswest2.sentinel-hub.com/ogc/wms/5a32b8-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=__CLOUD_COVERAGE&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2019-11-25',
    legendDefinitionJsonUrl: null,
  },
  'Sentinel-2 L2A': {
    id: '__CLOUD_COVERAGE',
    name: '__CLOUD_COVERAGE',
    description: '',
    dataset: 'S2L2A',
    image:
      'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=__CLOUD_COVERAGE&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2019-11-25',
    legendDefinitionJsonUrl: null,
  },
  'Sentinel-2 L1C': {
    id: '__CLOUD_COVERAGE',
    name: '__CLOUD_COVERAGE',
    description: '',
    dataset: 'S2L1C',
    image:
      'https://services.sentinel-hub.com/ogc/wms/cd2801-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=__CLOUD_COVERAGE&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2019-11-25',
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

const mapBoundsMorePassesPerDay = {
  _southWest: { lat: 66.35954206344545, lng: 167.60742187500003 },
  _northEast: { lat: 70.16274561770614, lng: 188.701171875 },
};

// const mapBoundsAralSea = {
//   _southWest: { lat: 44.0, lng: 57.7 },
//   _northEast: { lat: 46.4, lng: 60.15 },
// };

const presets = {
  'Sentinel-2 L1C': [
    {
      id: '1_TRUE_COLOR',
      name: 'True color',
      description: 'Based on bands 4,3,2',
      dataset: 'S2L1C',
      image:
        'https://services.sentinel-hub.com/ogc/wms/cd2801-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=1_TRUE_COLOR&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2019-11-12',
      legendDefinitionJsonUrl: null,
    },
  ],
  'Sentinel-2 L2A': [
    {
      id: '1_TRUE_COLOR',
      name: 'True color',
      description: 'Based on bands 4,3,2',
      dataset: 'S2L1C',
      image:
        'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=1_TRUE_COLOR&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2019-11-12',
      legendDefinitionJsonUrl: null,
    },
  ],
  'Sentinel-3 OLCI': [
    {
      id: '1_TRUE_COLOR',
      name: 'True color',
      description: 'Based on the combination of bands 8, 6, 4',
      dataset: 'S3OLCI',
      image:
        'https://creodias.sentinel-hub.com/ogc/wms/618157-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=1_TRUE_COLOR&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2020-02-27',
      legendDefinitionJsonUrl: null,
    },
  ],
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

const borders = (width, height, bbox) => ({
  sortIndex: 1,
  url: `https://api.maptiler.com/maps/${process.env.REACT_APP_MAPTILER_MAP_ID_BORDERS}/static/${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}/${width}x${height}.png?key=${process.env.REACT_APP_MAPTILER_KEY}&attribution=false`,
  params: {},
});

const labels = (width, height, bbox) => ({
  sortIndex: 2,
  url: `https://api.maptiler.com/maps/${process.env.REACT_APP_MAPTILER_MAP_ID_LABELS}/static/${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}/${width}x${height}.png?key=${process.env.REACT_APP_MAPTILER_KEY}&attribution=false`,
  params: {},
});
