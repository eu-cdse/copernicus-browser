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

import './index.scss';
import './cdas3d.scss';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <MetadataCacheProvider>
        <LanguageProvider>
          <DndProvider options={HTML5toTouch}>
            <AuthProvider>
              <URLParamsParser>
                {({ themeId, sharedPinsListId, compareShare }) => (
                  <ThemesProvider themeIdFromUrlParams={themeId}>
                    <PreselectedCollectionProvider>
                      <VisualizationUrlProvider>
                        <GoogleAPIProvider>
                          {({ googleAPI }) => (
                            <App
                              themeIdFromUrlParams={themeId}
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
          </DndProvider>
        </LanguageProvider>
      </MetadataCacheProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
