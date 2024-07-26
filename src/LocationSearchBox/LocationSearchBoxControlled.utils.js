import axios from 'axios';

export const isCoordinate = (string) => {
  const coordRegex = /^[ ]*[+-]?[0-9]{1,2}([.][0-9]+)?[ ]*[,][ ]*[+-]?[0-9]{1,3}([.][0-9]+)?[ ]*$/g;
  return coordRegex.test(string);
};

export const fetchLocationsFromCoordinates = (value) => {
  try {
    const [lat, lng] = value.trim().split(',');
    const locations = [
      {
        placeId: 0,
        label: value,
        location: [parseFloat(lng), parseFloat(lat)],
      },
    ];
    return locations;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchLocationsGisco = async (keyword, numberResultsShown) => {
  try {
    const url = `https://gisco-services.ec.europa.eu/api/?q=${keyword}&limit=${numberResultsShown}`;
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

    return locations;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchLocationsGoogle = async (keyword, googleAutocompleteService) => {
  try {
    const params = {
      input: keyword,
    };

    const { predictions } = await googleAutocompleteService.getPlacePredictions(params);

    const locations = predictions.map((location) => ({
      placeId: location.place_id,
      label: location.description,
      location: null,
    }));

    return locations;
  } catch (e) {
    console.error(e);
    return [];
  }
};
