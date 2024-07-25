import { t } from 'ttag';
import React from 'react';
import Autocomplete from 'react-autocomplete';
import axios from 'axios';
import onClickOutside from 'react-onclickoutside';
import debounce from 'lodash.debounce';
import L from 'leaflet';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import './LocationSearchBox.scss';

import poweredByGoogleImg from './google_on_white.png';

import styleVariables from '../../variables.module.scss';

const API_SWITCH = 'API_SWITCH';

const API_PROVIDER = {
  GISCO: 'GISCO_API',
  GOOGLE: 'GOOGLE_API',
  MAPBOX: 'MAPBOX_API',
};

class LocationSearchBoxControlled extends React.PureComponent {
  static defaultProps = {
    value: '',
    onChange: (value) => {},
    onSelect: (item) => {},
    minChar: 4,
    resultsShown: 5,
    placeholder: 'Search...',
    highlightedBgColor: styleVariables.primaryColor,
    menuStyle: {
      boxShadow: styleVariables.boxShadow,
      background: styleVariables.whiteBackground,
      color: styleVariables.textColor,
      zIndex: 9999,
      fontSize: '90%',
      position: 'absolute',
      overflow: 'auto',
      maxHeight: '500px',
      top: 40,
      left: 0,
      width: '100%',
    },
    inputWrapperStyle: { position: 'relative', width: '100%' },
  };

  state = {
    locationResults: [],
    showResults: false,
    apiProvider: null,
  };

  cancelTokenSource = null;
  input = undefined;

  componentDidMount() {
    this.updateApiProvider();
    this.debouncedOnInputChange = debounce(this.onInputChangeDelayed, 700);

    if (this.props.googleAPI) {
      this.googleAutocompleteService = new this.props.googleAPI.maps.places.AutocompleteService();
      this.googleGeocoder = new this.props.googleAPI.maps.Geocoder();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value || prevState.apiProvider !== this.state.apiProvider) {
      this.debouncedOnInputChange(this.props.value);
    }
    // only focus when there are more than 0 characters
    // This fixes behavoiur of having a dropdown appear when the input's characters are removed all at once
    if (this.props.value.length > 0) {
      this.input.focus();
    }

    if (
      (this.props.giscoAPI && !prevProps.giscoAPI) ||
      (this.props.googleAPI && !prevProps.googleAPI) ||
      (this.props.mapboxAccessToken && !prevProps.mapboxAccessToken)
    ) {
      this.updateApiProvider();
    }

    if (this.props.googleAPI && !prevProps.googleAPI) {
      this.googleAutocompleteService = new this.props.googleAPI.maps.places.AutocompleteService();
      this.googleGeocoder = new this.props.googleAPI.maps.Geocoder();
    }
  }

  componentWillUnmount() {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel();
    }
  }

  updateApiProvider = () => {
    this.setState({
      apiProvider: this.props.giscoAPI
        ? API_PROVIDER.GISCO
        : this.props.googleAPI
        ? API_PROVIDER.GOOGLE
        : this.props.mapboxAccessToken
        ? API_PROVIDER.MAPBOX
        : null,
    });
  };

  handleClickOutside = () => {
    this.setState({ showResults: false });
  };

  handleInputChange = (e) => {
    const value = e.target.value;
    this.props.onChange(value);
  };

  isCoordinate = (string) => {
    const coordRegex = /^[ ]*[+-]?[0-9]{1,2}([.][0-9]+)?[ ]*[,][ ]*[+-]?[0-9]{1,3}([.][0-9]+)?[ ]*$/g;
    return coordRegex.test(string);
  };

  onInputChangeDelayed = async (value) => {
    // only empty results, once input value is completely deleted
    if (value.length === 0) {
      this.setState({
        locationResults: [],
      });
    }

    if (value.length < this.props.minChar) {
      return;
    }

    if (this.isCoordinate(value)) {
      const [lat, lng] = value.trim().split(',');
      const locations = [
        {
          placeId: 0,
          label: value,
          location: [parseFloat(lng), parseFloat(lat)],
        },
      ];

      this.setState({
        locationResults: locations,
      });
    } else if (this.state.apiProvider === API_PROVIDER.GISCO) {
      this.fetchLocationsGisco(value);
    } else if (this.state.apiProvider === API_PROVIDER.GOOGLE) {
      this.fetchLocationsGoogle(value);
    } else if (this.state.apiProvider === API_PROVIDER.MAPBOX) {
      try {
        if (this.cancelTokenSource) {
          this.cancelTokenSource.cancel();
        }
        this.cancelTokenSource = axios.CancelToken.source();
        const locations = await this.fetchLocationsMapbox(value);

        this.setState({
          locationResults: locations,
        });

        this.cancelTokenSource = null;
      } catch (e) {
        this.cancelTokenSource = null;
        this.setState({ locationResults: [] });
        console.error(e);
      }
    }
  };

  fetchLocationsGisco = async (keyword) => {
    try {
      const url = `https://gisco-services.ec.europa.eu/api/?q=${keyword}&limit=${this.props.resultsShown}`;
      const { data } = await axios(url);

      const locations = data.features.map((location) => {
        const label = [
          ...(location.properties.name ? [location.properties.name] : []),
          ...(location.properties.district ? [location.properties.district] : []),
          ...(location.properties.city ? [location.properties.city] : []),
          ...(location.properties.country ? [location.properties.country] : []),
        ];

        return {
          placeId: location.properties.osm_id,
          label: label.join(', '),
          location: location.geometry.coordinates,
        };
      });

      this.setState({
        locationResults: locations,
      });
    } catch (e) {
      this.setState({ locationResults: [] });
      console.error(e);
    }
  };

  fetchLocationsMapbox = async (keyword) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${keyword}.json`;
    const requestParams = {
      params: {
        limit: this.props.resultsShown,
        types: [
          'country',
          'region',
          'postcode',
          'district',
          'place',
          'locality',
          'neighborhood',
          'address',
          'poi',
        ],
        access_token: this.props.mapboxAccessToken,
      },
      cancelToken: this.cancelTokenSource.token,
    };

    const { data } = await axios(url, requestParams);
    const locations = data.features.map((location) => ({
      placeId: location.id,
      label: location.matching_place_name || location.place_name,
      location: location.center,
    }));

    return locations;
  };

  fetchLocationsGoogle = async (keywords) => {
    const options = {
      input: keywords,
    };

    this.googleAutocompleteService.getPlacePredictions(options, (suggestions) => {
      if (!suggestions) {
        this.setState({
          locationResults: [],
        });
        return;
      }

      const locations = suggestions.map((location) => ({
        placeId: location.place_id,
        label: location.description,
        location: null,
      }));

      this.setState({
        locationResults: locations,
      });
    });
  };

  onSelectHandle = (inputValue, item) => {
    this.setState({ locationResults: [item] });

    if (
      this.isCoordinate(inputValue) ||
      this.state.apiProvider === API_PROVIDER.MAPBOX ||
      this.state.apiProvider === API_PROVIDER.GISCO
    ) {
      this.props.onSelect(item);
    } else if (this.state.apiProvider === API_PROVIDER.GOOGLE) {
      this.googleGeocoder.geocode({ placeId: item.placeId }, (results, status) => {
        if (status !== this.props.googleAPI.maps.GeocoderStatus.OK) {
          console.error(`Geocoder failed converting placeId to lat/lng, status: ${status}`);
          return;
        }
        if (results.length === 0) {
          console.error('Geocoder: no results found, could not convert placeId to lat/lng');
          return;
        }
        item.location = [results[0].geometry.location.lng(), results[0].geometry.location.lat()];
        const { viewport } = results[0].geometry;
        const { south, north, east, west } = viewport.toJSON();
        item.bounds = L.latLngBounds(L.latLng(south, west), L.latLng(north, east));

        this.props.onSelect(item);
      });
    } else {
      console.error('Something is wrong with the selected option.');
    }
  };

  handleRenderItem = (item, isHighlighted) => {
    const { highlightedBgColor } = this.props;
    const customStyle = {
      backgroundColor: isHighlighted ? highlightedBgColor : '',
      color: isHighlighted ? styleVariables.whiteColor : '',
    };

    if (item.placeId === API_SWITCH) {
      return (
        <div className="api-switch" key={item.placeId}>
          <label>
            <input
              id={API_PROVIDER.GISCO}
              name={API_SWITCH}
              type="radio"
              checked={this.state.apiProvider === API_PROVIDER.GISCO}
              onClick={() => this.setState({ apiProvider: API_PROVIDER.GISCO })}
              readOnly={true}
            ></input>
            {t`Gisco search`}
          </label>
          <label>
            <input
              id={API_PROVIDER.GOOGLE}
              name={API_SWITCH}
              type="radio"
              checked={this.state.apiProvider === API_PROVIDER.GOOGLE}
              onClick={() => this.setState({ apiProvider: API_PROVIDER.GOOGLE })}
              readOnly={true}
            ></input>
            {t`Google search`}
            {this.state.apiProvider === API_PROVIDER.GOOGLE ? (
              <img className="powered-by-google" alt={t`Powered by Google`} src={poweredByGoogleImg} />
            ) : null}
          </label>
        </div>
      );
    }

    return (
      <div className="search-item" key={item.placeId} style={customStyle}>
        {item.label}
      </div>
    );
  };

  render() {
    const { locationResults } = this.state;
    const { value, placeholder, slim, inputStyle, inputWrapperStyle, handleSearchClick, isSearchVisible } =
      this.props;

    const apiSwitchPlaceholder = { placeId: API_SWITCH, label: '' };

    const autoComplete = (
      <Autocomplete
        ref={(el) => (this.input = el)}
        value={value}
        items={[
          ...locationResults,
          ...(this.props.giscoAPI && locationResults.length > 0 ? [apiSwitchPlaceholder] : []),
        ]}
        getItemValue={(item) => item.label}
        onSelect={this.onSelectHandle}
        onChange={this.handleInputChange}
        inputProps={{ placeholder: placeholder, style: inputStyle }}
        isItemSelectable={(item) => item.placeId !== API_SWITCH}
        renderItem={this.handleRenderItem}
        wrapperStyle={inputWrapperStyle}
        menuStyle={this.props.menuStyle}
      />
    );

    if (slim) {
      return autoComplete;
    }

    return (
      <div className="location-search-box" id="location-search-box">
        <div className={`autocomplete ${isSearchVisible ? 'open' : 'close'}`}>
          <FontAwesomeIcon icon={faSearch} className="icon-search" onClick={handleSearchClick} />
          {autoComplete}
        </div>
      </div>
    );
  }
}

export default onClickOutside(LocationSearchBoxControlled);
