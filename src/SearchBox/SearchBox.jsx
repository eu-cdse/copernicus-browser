import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import LocationSearchBox from '../LocationSearchBox/LocationSearchBox';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import { withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import store, { mainMapSlice } from '../store';
import { t } from 'ttag';
import { getBoundsZoomLevel } from '../utils/coords';
import proj4 from 'proj4';

class SearchBox extends Component {
  state = {
    isSearchVisible: false,
  };

  componentDidMount() {
    L.DomEvent.disableScrollPropagation(this.ref);
    L.DomEvent.disableClickPropagation(this.ref);
  }

  setMapLocation = (data) => {
    const { is3D, minZoom, maxZoom } = this.props;
    const [lng, lat] = data.location;
    let currentZoom = this.props.zoom || 12;

    if (minZoom) {
      currentZoom = Math.max(currentZoom, minZoom);
    }

    if (maxZoom) {
      currentZoom = Math.min(currentZoom, maxZoom);
    }

    if (data.bounds) {
      currentZoom = this.getCurrentZoom(data.bounds);
    }

    store.dispatch(
      mainMapSlice.actions.setPosition({
        lat: lat,
        lng: lng,
        zoom: currentZoom,
      }),
    );
    if (is3D) {
      const [x, y] = proj4('EPSG:4326', 'EPSG:3857', [lng, lat]);
      window.set3DLocation(x, y, currentZoom);
    }
    if (this.props.onSelectLocationCallback) {
      this.props.onSelectLocationCallback();
    }
  };

  getCurrentZoom = (bounds) => {
    const { minZoom, maxZoom } = this.props;
    let currentZoom = getBoundsZoomLevel(bounds);
    if (currentZoom < minZoom) {
      currentZoom = minZoom;
    }
    if (currentZoom > maxZoom) {
      currentZoom = maxZoom;
    }
    return currentZoom;
  };

  handleClickOutside = () => {
    this.setState({ isSearchVisible: false });
  };

  handleSearchClick = () => {
    this.setState((prevState) => {
      return {
        isSearchVisible: !prevState.isSearchVisible,
      };
    });
  };

  render() {
    const { googleAPI, giscoAPI, is3D, className } = this.props;

    return (
      <div
        ref={(r) => {
          this.ref = r;
        }}
        className={`search-box-wrapper ${this.state.isSearchVisible ? 'open' : 'close'}  ${
          is3D ? 'position-with-3d' : ''
        } ${className || ''}`}
      >
        <LocationSearchBox
          googleAPI={googleAPI}
          giscoAPI={giscoAPI}
          placeholder={t`Go to Place`}
          minChar={4}
          resultsShown={5}
          onSelect={this.setMapLocation}
          handleSearchClick={this.handleSearchClick}
          isSearchVisible={this.state.isSearchVisible}
        />
      </div>
    );
  }
}

export default withLeaflet(onClickOutside(SearchBox));
