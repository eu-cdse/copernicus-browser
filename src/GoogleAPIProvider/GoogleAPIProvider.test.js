import React from 'react';
import { act, render } from '@testing-library/react';
import GoogleAPIProvider from './GoogleAPIProvider';
import { Loader } from '@googlemaps/js-api-loader';

jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn(),
}));

function renderProvider() {
  let latestArgs;
  const children = (args) => {
    latestArgs = args;
    return null;
  };
  render(<GoogleAPIProvider>{children}</GoogleAPIProvider>);
  return {
    getLatestArgs: () => latestArgs,
  };
}

describe('GoogleAPIProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('does not construct the Loader on mount (lazy load, no eager auto-load)', () => {
    renderProvider();

    expect(Loader).not.toHaveBeenCalled();
  });

  test('loadGoogleApi constructs the Loader once and populates googleAPI after resolving', async () => {
    const AutocompleteService = function AutocompleteService() {};
    const Geocoder = function Geocoder() {};
    const GeocoderStatus = { OK: 'OK' };

    Loader.mockImplementation(() => ({
      importLibrary: jest.fn((library) => {
        if (library === 'places') {
          return Promise.resolve({ AutocompleteService });
        }
        if (library === 'geocoding') {
          return Promise.resolve({ Geocoder, GeocoderStatus });
        }
        return Promise.reject(new Error(`unexpected library: ${library}`));
      }),
    }));

    const { getLatestArgs } = renderProvider();

    expect(getLatestArgs().googleAPI).toBeNull();
    expect(getLatestArgs().isGoogleApiLoading).toBe(false);

    let loadPromise;
    act(() => {
      loadPromise = getLatestArgs().loadGoogleApi();
    });

    expect(getLatestArgs().isGoogleApiLoading).toBe(true);

    await act(async () => {
      await loadPromise;
    });

    expect(Loader).toHaveBeenCalledTimes(1);
    expect(getLatestArgs().isGoogleApiLoading).toBe(false);
    expect(getLatestArgs().googleAPI).toEqual({
      maps: {
        places: { AutocompleteService },
        Geocoder,
        GeocoderStatus,
      },
    });
  });

  test('loadGoogleApi resets isGoogleApiLoading and allows a retry when the load fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    Loader.mockImplementationOnce(() => ({
      importLibrary: jest.fn(() => Promise.reject(new Error('network error'))),
    }));

    const { getLatestArgs } = renderProvider();

    await act(async () => {
      await getLatestArgs().loadGoogleApi();
    });

    expect(getLatestArgs().googleAPI).toBeNull();
    expect(getLatestArgs().isGoogleApiLoading).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    Loader.mockImplementation(() => ({
      importLibrary: jest.fn((library) => {
        if (library === 'places') {
          return Promise.resolve({ AutocompleteService: jest.fn() });
        }
        return Promise.resolve({ Geocoder: jest.fn(), GeocoderStatus: {} });
      }),
    }));

    await act(async () => {
      await getLatestArgs().loadGoogleApi();
    });

    expect(Loader).toHaveBeenCalledTimes(2);
    expect(getLatestArgs().googleAPI).not.toBeNull();

    consoleErrorSpy.mockRestore();
  });

  test('calling loadGoogleApi twice in a row only constructs the Loader once', async () => {
    Loader.mockImplementation(() => ({
      importLibrary: jest.fn((library) => {
        if (library === 'places') {
          return Promise.resolve({ AutocompleteService: jest.fn() });
        }
        return Promise.resolve({ Geocoder: jest.fn(), GeocoderStatus: {} });
      }),
    }));

    const { getLatestArgs } = renderProvider();

    let firstCallPromise;
    let secondCallPromise;
    act(() => {
      firstCallPromise = getLatestArgs().loadGoogleApi();
      secondCallPromise = getLatestArgs().loadGoogleApi();
    });

    await act(async () => {
      await Promise.all([firstCallPromise, secondCallPromise]);
    });

    expect(Loader).toHaveBeenCalledTimes(1);
  });
});
