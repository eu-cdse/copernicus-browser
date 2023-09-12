import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'react-app-polyfill/stable';
import { DndProvider } from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';
import { BrowserRouter } from 'react-router-dom';

import store from './store';
import App from './App';
import LanguageProvider from './LanguageSelector/LanguageProvider';
import AuthProvider from './Auth/AuthProvider';
import URLParamsParser from './URLParamsParser/URLParamsParser';
import ThemesProvider from './ThemesProvider/ThemesProvider';
import PreselectedCollectionProvider from './PreselectedCollectionProvider/PreselectedCollectionProvider';
import VisualizationUrlProvider from './VisualizationUrlProvider/VisualizationUrlProvider';
import GoogleAPIProvider from './GoogleAPIProvider/GoogleAPIProvider';
import MetadataCacheProvider from './MetadataCacheProvider/MetadataCacheProvider';
import { CacheLocation, FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

import './index.scss';
import './cdas3d.scss';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <MetadataCacheProvider>
        <LanguageProvider>
          <DndProvider options={HTML5toTouch}>
            <FpjsProvider
              loadOptions={{
                apiKey: process.env.REACT_APP_FINGERPRINT_API_KEY,
                region: 'eu',
                scriptUrlPattern: [
                  // This endpoint will be used primarily
                  'https://fpjscdn.net/v<version>/<apiKey>/loader_v<loaderVersion>.js',
                  // The default endpoint will be used if the primary fails
                  FingerprintJS.defaultScriptUrlPattern,
                ],
                endpoint: 'https://metrics.dataspace.copernicus.eu',
              }}
              cacheLocation={CacheLocation.NoCache}
            >
              <AuthProvider>
                <URLParamsParser>
                  {({ themeId, sharedPinsListId, compareShare }) => (
                    <ThemesProvider themeIdFromUrlParams={themeId}>
                      <PreselectedCollectionProvider>
                        <VisualizationUrlProvider>
                          <GoogleAPIProvider>
                            {({ googleAPI }) => (
                              <App
                                sharedPinsListIdFromUrlParams={sharedPinsListId}
                                googleAPI={googleAPI}
                                compareShare={compareShare}
                              />
                            )}
                          </GoogleAPIProvider>
                        </VisualizationUrlProvider>
                      </PreselectedCollectionProvider>
                    </ThemesProvider>
                  )}
                </URLParamsParser>
              </AuthProvider>
            </FpjsProvider>
          </DndProvider>
        </LanguageProvider>
      </MetadataCacheProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
