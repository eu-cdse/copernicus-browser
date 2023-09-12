import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { EOBPOIPanelButton } from '../EOBPOIPanelButton';

const stories = storiesOf('EOB - Panel - POI', module);

stories
  .add('Default', ({ state, setState }) => {
    return (
      <EOBPOIPanelButton
        openFisPopup={() => setState({ openFisPopup: true })}
        drawMarker={() => setState({ drawMarker: true })}
        poi={null}
        deleteMarker={() => setState({ deleteMarker: true })}
        selectedResult={null}
        centerOnFeature={() => setState({ centerOnFeature: true })}
        disabled={true}
        onErrorMessage={(msg) => setState({ errorMsg: msg })}
      />
    );
  })
  .add('Logged In', () => <EOBPOIPanelButtonWithMockedData />);

class EOBPOIPanelButtonWithMockedData extends React.Component {
  state = {
    poi: null,
  };

  onDrawMarker = () => {
    this.setState({ poi: poiSample });
  };

  onDeleteMarker = () => {
    this.setState({ poi: null });
  };

  render() {
    const { poi } = this.state;

    return (
      <EOBPOIPanelButton
        openFisPopup={() => console.log('openFisPopup')}
        drawMarker={this.onDrawMarker}
        poi={poi}
        deleteMarker={this.onDeleteMarker}
        selectedResult={selectedResult}
        centerOnFeature={() => console.log('centerOnFeature')}
        disabled={false}
        presetLayerName={'True color'}
        fisShadowLayer={fisShadowLayer}
        onErrorMessage={(msg) => console.log('onErrorMessage: ', msg)}
      />
    );
  }
}

const poiSample = {
  geometry: {
    type: 'Point',
    coordinates: [13.287964, 42.415346],
  },
  polygon: {
    geometry: {
      type: 'Polygon',
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:EPSG::4326',
        },
      },
      coordinates: [
        [
          [13.287789851167549, 42.41522166469286],
          [13.288133173915583, 42.41522166469286],
          [13.288133173915583, 42.41547513118547],
          [13.287789851167549, 42.41547513118547],
          [13.287789851167549, 42.41522166469286],
        ],
      ],
    },
  },
};

const fisShadowLayer = {
  id: '__FIS_3_NDVI',
  name: '__FIS_3_NDVI',
  description: '',
  dataset: 'S2L2A',
  image:
    'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE?showLogo=false&SERVICE=WMS&REQUEST=GetMap&LAYERS=__FIS_3_NDVI&BBOX=-19482,6718451,-18718,6719216&MAXCC=10&WIDTH=40&HEIGHT=40&evalscriptoverrides=Z2Fpbk92ZXJyaWRlPTE7&FORMAT=image/jpeg&bgcolor=00000000&transparent=1&TIME=2015-01-01/2019-10-30',
  legendDefinitionJsonUrl: null,
};

const selectedResult = {
  name: 'Sentinel-2 L2A',
  id: 'S2L2A',
  group: 'SENTINEL-2',
  evalsource: 'S2L2A',
  baseUrls: {
    WMS: 'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE',
    FIS: 'https://services.sentinel-hub.com/ogc/fis/ed64bf-YOUR-INSTANCEID-HERE',
  },
  search: {
    tooltip: 'Wider Europe from 2017/03/28 onward',
    label: 'L2A',
    preselected: false,
    searchableByArea: true,
  },
  typename: 'DSS2',
  minDate: '2017-03-28',
  shortName: 'L2A',
  siblingDatasourceId: 'S2L1C',
  awsLink: 'http://sentinel-s2-l1c.s3-website.eu-central-1.amazonaws.com/',
  indexService: 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex',
  resolution: 10,
  fisResolutionCeiling: 1400,
  maxZoom: 16,
  allowOverZoomBy: 2,
  minZoom: 7,
  preset: '3_NDVI',
  evalscripturl: '',
  activeLayer: {
    name: 'Sentinel-2 L2A',
    id: 'S2L2A',
    group: 'SENTINEL-2',
    evalsource: 'S2L2A',
    baseUrls: {
      WMS: 'https://services.sentinel-hub.com/ogc/wms/ed64bf-YOUR-INSTANCEID-HERE',
      FIS: 'https://services.sentinel-hub.com/ogc/fis/ed64bf-YOUR-INSTANCEID-HERE',
    },
    search: {
      tooltip: 'Wider Europe from 2017/03/28 onward',
      label: 'L2A',
      preselected: false,
      searchableByArea: true,
    },
    typename: 'DSS2',
    minDate: '2017-03-28',
    shortName: 'L2A',
    siblingDatasourceId: 'S2L1C',
    awsLink: 'http://sentinel-s2-l1c.s3-website.eu-central-1.amazonaws.com/',
    indexService: 'https://services.sentinel-hub.com/index/v3/collections/S2L2A/searchIndex',
    resolution: 10,
    fisResolutionCeiling: 1400,
    maxZoom: 16,
    allowOverZoomBy: 2,
    minZoom: 7,
  },
  datasource: 'Sentinel-2 L2A',
  time: '2019-10-28',
  evalscript: 'cmV0dXJuIFtCMDEqMi41LEIwMioyLjUsQjAzKjIuNV07',
  layers: {
    r: 'B01',
    g: 'B02',
    b: 'B03',
  },
};
