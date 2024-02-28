import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { EOBAOIPanelButton } from '../EOBAOIPanelButton';

const stories = storiesOf('EOB - Panel - AOI', module);

stories
  .add('Default', ({ state, setState }) => {
    return (
      <EOBAOIPanelButton
        openFisPopup={() => setState({ openFisPopup: true })}
        aoiBounds={null}
        isAoiClip={null}
        mapGeometry={null}
        selectedResult={null}
        resetAoi={() => setState({ resetAoi: true })}
        openUploadGeoFileDialog={() => setState({ openUploadGeoFileDialog: true })}
        centerOnFeature={() => setState({ centerOnFeature: true })}
        disabled={true}
        onErrorMessage={(msg) => setState({ errorMsg: msg })}
      />
    );
  })
  .add('Logged In', () => <EOBPOIPanelButtonWithMockedData />);

class EOBPOIPanelButtonWithMockedData extends React.Component {
  state = {
    aoiBounds: null,
  };

  onDrawPolygon = () => {
    this.setState({ aoiBounds: aoiBoundsSample });
  };

  onResetAoi = () => {
    this.setState({ aoiBounds: null });
  };

  render() {
    const { aoiBounds } = this.state;

    return (
      <EOBAOIPanelButton
        openFisPopup={() => console.log('openFisPopup')}
        onDrawPolygon={this.onDrawPolygon}
        aoiBounds={aoiBounds}
        isAoiClip={null}
        mapGeometry={null}
        selectedResult={selectedResult}
        resetAoi={this.onResetAoi}
        openUploadGeoFileDialog={() => console.log('openUploadGeoFileDialog')}
        centerOnFeature={() => console.log('centerOnFeature')}
        disabled={false}
        presetLayerName={'True color'}
        fisShadowLayer={fisShadowLayer}
        onErrorMessage={(msg) => console.log('onErrorMessage: ', msg)}
      />
    );
  }
}

const aoiBoundsSample = {
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [12.719421, 42.101279],
        [12.605438, 42.000325],
        [12.803192, 41.916585],
        [12.86499, 42.051332],
        [12.719421, 42.101279],
      ],
    ],
  },
  bounds: {
    _southWest: {
      lat: 41.91658511622838,
      lng: 12.605438232421877,
    },
    _northEast: {
      lat: 42.101279269468726,
      lng: 12.864990234375,
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
