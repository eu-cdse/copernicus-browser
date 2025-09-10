import React, { useEffect, useState, useRef } from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { t } from 'ttag';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';

import {
  fetchLocationsFromCoordinates,
  fetchLocationsGisco,
  fetchLocationsGoogle,
  isCoordinate,
} from './LocationSearchBoxControlled.utils';

import poweredByGoogleImg from './google_on_white.png';

import './LocationSearchBox.scss';

const API_SWITCH = 'API_SWITCH';

const API_PROVIDER = {
  GISCO: 'GISCO_API',
  GOOGLE: 'GOOGLE_API',
};

function listenForOutsideClicks(menuRef, setShowResults) {
  const handleClick = (evt) => {
    if (menuRef.current?.contains(evt.target)) {
      return;
    }
    setShowResults(false);
  };

  document.addEventListener('click', handleClick);
  document.addEventListener('touchstart', handleClick);

  return () => {
    document.removeEventListener('click', handleClick);
    document.removeEventListener('touchstart', handleClick);
  };
}

const getProviderOptions = () => [
  { provider: API_PROVIDER.GISCO, getLabel: () => t`Gisco search` },
  {
    provider: API_PROVIDER.GOOGLE,
    getLabel: () => t`Google search`,
    logo: {
      src: poweredByGoogleImg,
      getAltText: () => t`Powered by Google`,
      className: 'powered-by-google',
    },
  },
];

const LocationSearchBoxControlled = (props) => {
  const menuRef = useRef(null);

  const {
    value,
    googleAPI,
    giscoAPI,
    minChar,
    isSearchVisible,
    handleSearchClick,
    onValueChange,
    placeholder,
    onSelect,
    resultsShown: numberResultsShown,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [apiProvider, setApiProvider] = useState(null);
  const [googleAutocompleteService, setGoogleAutocompleteService] = useState(undefined);
  const [googleGeocoder, setGoogleGeocoder] = useState(undefined);

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }
    return listenForOutsideClicks(menuRef, setShowResults);
  }, [menuRef]);

  const updateApiProvider = () => {
    const newApiProvider = giscoAPI ? API_PROVIDER.GISCO : googleAPI ? API_PROVIDER.GOOGLE : null;

    setApiProvider(newApiProvider);
  };

  const setGoogleServices = () => {
    setGoogleAutocompleteService(new googleAPI.maps.places.AutocompleteService());
    setGoogleGeocoder(new googleAPI.maps.Geocoder());
  };

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onInputChange = async (val) => {
    setIsLoading(true);

    onValueChange(val);
    if (val.length === 0) {
      if (isMounted.current) {
        setLocationResults([]);
      }
    }

    if (val.length < minChar) {
      if (isMounted.current) {
        setIsLoading(false);
      }
      return;
    }

    let locationResults;
    if (isCoordinate(val)) {
      locationResults = fetchLocationsFromCoordinates(value);
    } else if (apiProvider === API_PROVIDER.GISCO) {
      locationResults = await fetchLocationsGisco(val, numberResultsShown);
    } else if (apiProvider === API_PROVIDER.GOOGLE) {
      locationResults = await fetchLocationsGoogle(val, googleAutocompleteService);
    }

    if (isMounted.current) {
      setLocationResults(locationResults);
      setIsLoading(false);
    }
  };

  const onSelectHandle = (selected) => {
    if (selected.length === 0) {
      return;
    }

    const selectedItem = selected.at(0);
    if (selectedItem === null || selectedItem === undefined || selectedItem.placeId === API_SWITCH) {
      return;
    }

    setLocationResults([selectedItem]);
    setShowResults(false);

    if (isCoordinate(selectedItem) || apiProvider === API_PROVIDER.GISCO) {
      onSelect(selectedItem);
    } else if (apiProvider === API_PROVIDER.GOOGLE) {
      googleGeocoder.geocode({ placeId: selectedItem.placeId }, (results, status) => {
        if (!isMounted.current) {
          return;
        }
        if (status !== googleAPI.maps.GeocoderStatus.OK) {
          console.error(`Geocoder failed converting placeId to lat/lng, status: ${status}`);
          return;
        }
        if (results.length === 0) {
          console.error('Geocoder: no results found, could not convert placeId to lat/lng');
          return;
        }

        selectedItem.location = [results[0].geometry.location.lng(), results[0].geometry.location.lat()];
        const { viewport } = results[0].geometry;
        const { south, north, east, west } = viewport.toJSON();
        selectedItem.bounds = L.latLngBounds(L.latLng(south, west), L.latLng(north, east));
        onSelect(selectedItem);
      });
    } else {
      console.error('Something is wrong with the selected option.');
    }
  };

  const formatItem = (item) => {
    if (item.placeId === API_SWITCH) {
      return (
        <div className="api-switch" key={item.placeId}>
          {getProviderOptions().map((po) => (
            <label key={po.provider} onClick={() => setApiProvider(po.provider)}>
              <input
                id={po.provider}
                name={API_SWITCH}
                type="radio"
                checked={apiProvider === po.provider}
                readOnly={true}
              ></input>
              {po.getLabel()}
              {po.logo && <img className={po.logo.className} alt={po.logo.getAltText()} src={po.logo.src} />}
            </label>
          ))}
        </div>
      );
    }

    return (
      <div className="search-item" key={item.placeId}>
        {item.label}
      </div>
    );
  };

  useEffect(() => {
    updateApiProvider();

    if (googleAPI) {
      setGoogleServices();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateApiProvider();

    if (googleAPI) {
      setGoogleServices();
    }
  }, [googleAPI, giscoAPI]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const refetchAsync = async () => {
      await onInputChange(value);
    };

    refetchAsync();
  }, [value, apiProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  const areProvidersSwitchable = giscoAPI && googleAPI;
  const shouldShowProviderSwitch = areProvidersSwitchable && locationResults?.length > 0;
  const searchableOptions = [
    ...locationResults,
    ...(shouldShowProviderSwitch ? [{ placeId: API_SWITCH, label: value }] : []),
  ];
  return (
    <div className="location-search-box" id="location-search-box">
      <div ref={menuRef} className={`autocomplete ${isSearchVisible ? 'open' : 'close'}`}>
        <FontAwesomeIcon icon={faSearch} className="icon-search" onClick={handleSearchClick} />
        <AsyncTypeahead
          id="async-places"
          delay={700}
          labelKey={(opt) => `${opt.label}`}
          open={showResults}
          promptText={null}
          searchText={null}
          placeholder={placeholder}
          filterBy={() => true}
          isLoading={isLoading}
          options={searchableOptions}
          minLength={minChar}
          renderMenuItemChildren={formatItem}
          onFocus={() => setShowResults(true)}
          onSearch={onValueChange}
          onChange={onSelectHandle}
          useCache={false}
        />
      </div>
    </div>
  );
};

export default LocationSearchBoxControlled;
