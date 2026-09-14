import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';

import LocationSearchBoxControlled from './LocationSearchBoxControlled';
import { fetchLocationsGisco, fetchLocationsGoogle, isCoordinate } from './LocationSearchBoxControlled.utils';

jest.mock('./LocationSearchBoxControlled.utils', () => ({
  isCoordinate: jest.fn(() => false),
  fetchLocationsFromCoordinates: jest.fn(),
  fetchLocationsGisco: jest.fn(),
  fetchLocationsGoogle: jest.fn(),
}));

jest.mock('../GoogleAPIProvider/GoogleAPIProvider', () => ({
  isGoogleApiConfigured: true,
}));

jest.mock('react-bootstrap-typeahead', () => ({
  AsyncTypeahead: ({ isLoading, options, renderMenuItemChildren }) => (
    <div>
      {isLoading && <div data-testid="loading-indicator" />}
      <div data-testid="options">
        {options.map((opt) => (
          <div key={opt.placeId}>{renderMenuItemChildren(opt)}</div>
        ))}
      </div>
    </div>
  ),
}));

const defaultProps = {
  value: '',
  googleAPI: null,
  loadGoogleApi: jest.fn(),
  isGoogleApiLoading: false,
  giscoAPI: true,
  minChar: 2,
  isSearchVisible: true,
  handleSearchClick: jest.fn(),
  onValueChange: jest.fn(),
  placeholder: '',
  onSelect: jest.fn(),
  resultsShown: 5,
};

function renderComponent(props = {}) {
  return render(<LocationSearchBoxControlled {...defaultProps} {...props} />);
}

// Clicking the "Google search" <label> (rather than the radio it wraps) makes the browser fire an
// extra synthetic click on the nested <input>, which bubbles back up through the label and
// double-invokes its onClick — so tests click the radio input directly to get a single click.
function clickGoogleRadio() {
  const radios = screen.getAllByRole('radio');
  fireEvent.click(radios[radios.length - 1]);
}

const loadedGoogleAPI = {
  maps: {
    places: { AutocompleteService: function AutocompleteService() {} },
    Geocoder: function Geocoder() {},
    GeocoderStatus: { OK: 'OK' },
  },
};

describe('LocationSearchBoxControlled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isCoordinate.mockReturnValue(false);
    fetchLocationsGisco.mockResolvedValue([{ placeId: 1, label: 'London' }]);
    fetchLocationsGoogle.mockResolvedValue([{ placeId: 2, label: 'Los Angeles' }]);
  });

  test('clicking "Google search" triggers loadGoogleApi when the SDK is not yet loaded', async () => {
    const loadGoogleApi = jest.fn();
    const { rerender } = renderComponent({ loadGoogleApi });

    await act(async () => {
      rerender(<LocationSearchBoxControlled {...defaultProps} loadGoogleApi={loadGoogleApi} value="Lo" />);
    });

    expect(fetchLocationsGisco).toHaveBeenCalledWith('Lo', defaultProps.resultsShown);

    await act(async () => {
      clickGoogleRadio();
    });

    expect(loadGoogleApi).toHaveBeenCalledTimes(1);
  });

  test('clicking "Google search" does not re-trigger loadGoogleApi once the SDK is already loaded', async () => {
    const loadGoogleApi = jest.fn();
    const { rerender } = renderComponent({ loadGoogleApi, googleAPI: loadedGoogleAPI });

    await act(async () => {
      rerender(
        <LocationSearchBoxControlled
          {...defaultProps}
          loadGoogleApi={loadGoogleApi}
          googleAPI={loadedGoogleAPI}
          value="Lo"
        />,
      );
    });

    await act(async () => {
      clickGoogleRadio();
    });

    expect(loadGoogleApi).not.toHaveBeenCalled();
  });

  test('early-return guard: switching to Google before the autocomplete service is ready skips the fetch and clears the loading state', async () => {
    const { rerender } = renderComponent();

    await act(async () => {
      rerender(<LocationSearchBoxControlled {...defaultProps} value="Lo" />);
    });

    // googleAPI stays null (as it would while the lazy load is in flight), so
    // googleAutocompleteService is never created.
    await act(async () => {
      clickGoogleRadio();
    });

    expect(fetchLocationsGoogle).not.toHaveBeenCalled();
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  test('combined spinner logic: isGoogleApiLoading only surfaces as a loading state while the Google provider is selected', async () => {
    const { rerender } = renderComponent({ isGoogleApiLoading: true });

    await act(async () => {
      rerender(<LocationSearchBoxControlled {...defaultProps} isGoogleApiLoading={true} value="Lo" />);
    });

    // Still on the default GISCO provider, so the Google loader flag must not spin the search box.
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    await act(async () => {
      clickGoogleRadio();
    });

    await act(async () => {
      rerender(<LocationSearchBoxControlled {...defaultProps} isGoogleApiLoading={true} value="Lo" />);
    });

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
});
