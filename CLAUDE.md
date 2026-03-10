# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:3000 (runs version-check first)
npm run build      # Production build to ./build/
npm test           # Run unit tests with Jest
npm run test-integration  # Run integration tests only
npm run lint       # Full lint: TypeScript check + ESLint + Stylelint
npm run lint-js    # ESLint only
npm run lint-css   # Stylelint only
npm run prettier   # Auto-format all source files
npm run type-check # TypeScript check (non-blocking, exits 0 regardless)
npm run translate  # Regenerate translation files
```

Run a single test file:

```bash
npx jest src/path/to/file.test.js
```

Update metadata caches (requires admin env vars):

```bash
npm run update-metadata-cache-bundle
```

## Architecture

### Provider Tree (index.jsx → App.jsx)

The app wraps in this order: Redux `Provider` → `BrowserRouter` → `MetadataCacheProvider` → `LanguageProvider` → `DndProvider` → `AuthProvider` → `URLParamsParser` → `ThemesProvider` → `PreselectedCollectionProvider` → `VisualizationUrlProvider` → `GoogleAPIProvider` → `App`.

Understanding this chain is essential: `ThemesProvider` initializes data source handlers and Sentinel Hub configurations. `AuthProvider` handles both Keycloak (logged-in users) and anonymous reCAPTCHA-based tokens.

### Redux Store (src/store.js)

All state is in a single store with named slices. Key slices:

- `mainMapSlice` – map position, zoom, base layer
- `visualizationSlice` – active layer, dataset, evalscript, effects
- `authSlice` – user object, auth token
- `themesSlice` – theme list, selected theme
- `modalSlice` – modal stack (`addModal`/`removeModal`)
- `tabsSlice` – active sidebar tab
- `aoiSlice`, `poiSlice`, `loiSlice` – area/point/line of interest geometry
- `pinsSlice` – saved pins
- `compareLayersSlice` – compare panel state

### Tools Sidebar (src/Tools/)

The sidebar has tabs managed by `tabsSlice`. Panels:

- `SearchPanel/` – dataset search, date picker, results list
- `VisualizationPanel/` – layer selection, evalscript editor, effects
- `Pins/` – saved locations/scenes
- `ComparePanel/` – side-by-side layer comparison
- `CommercialDataPanel/` – commercial data ordering
- `RapidResponseDesk/` – RRD tool (access restricted by Keycloak group)

### Controls (src/Controls/)

Legacy class components for map overlays: `FIS`, `SpectralExplorer`, `Timelapse`, `ImgDownload`, `Histogram`, `ElevationProfile`, `Measure`, `AOI/LOI/POI`. These are opened as modals via Redux and rendered in `src/Modals/Utils.jsx`. **When modifying these, refactor to functional components only if directly touched.**

### Data Source Handlers (src/Tools/SearchPanel/dataSourceHandlers/)

Each satellite/dataset has a handler extending `DataSourceHandler.js`. Handlers define search capabilities, layer configuration, evalscript support, and rendering options. `dataSourceHandlers.jsx` exports `prepareDataSourceHandlers` (called by `ThemesProvider`) and `getDataSourceHandler(datasourceId)`.

### API Layer (src/api/)

- `OData/` – Copernicus Data Space search API with filter builder, query builder, and type system
- `openEO/` – openEO process graph API
- `RRD/` – Rapid Response Desk API

### Map (src/Map/)

React-Leaflet-based map. `Layers.js` defines base layers and overlay tile layers. `Map.jsx` is the main map component integrating satellite imagery tiles from Sentinel Hub.

### Authentication

Two auth flows managed by `AuthProvider`:

1. **Keycloak** – for logged-in users via `initKeycloak()` in `authHelpers.js`
2. **Anonymous** – reCAPTCHA-based token via `VITE_ANON_AUTH_SERVICE_URL`

Auth token is set on `sentinelhub-js` via `setAuthToken()` from `@sentinel-hub/sentinelhub-js`.

### Metadata Cache (src/assets/cache/)

Generated files – never edit manually. Regenerate with `npm run update-metadata-cache-bundle`. Static layer definitions are in `src/assets/layers_metadata.js` (`PREDEFINED_LAYERS_METADATA`).

### Internationalization

All user-facing strings use `ttag`: `import { t } from 'ttag'`. Template literals: `` t`My string` ``. Run `npm run translate` to extract strings. Debug mode: `npm run debug-translations`.

## Environment Variables

Copy `.env.example` to `.env`. All variables use the `VITE_` prefix (Vite convention):

| Variable                       | Purpose                          |
| ------------------------------ | -------------------------------- |
| `VITE_ROOT_URL`                | App root URL                     |
| `VITE_AUTH_BASEURL`            | Keycloak/identity base URL       |
| `VITE_REALM`                   | Keycloak realm                   |
| `VITE_CLIENTID`                | Keycloak client ID               |
| `VITE_SH_SERVICES_URL`         | Sentinel Hub services base URL   |
| `VITE_CAPTCHA_SITE_KEY`        | reCAPTCHA site key               |
| `VITE_ANON_AUTH_SERVICE_URL`   | Anonymous auth service           |
| `VITE_CDSE_BACKEND`            | Backend for pins and timelapses  |
| `VITE_GOOGLE_TOKEN`            | Google Maps token                |
| `VITE_CDAS_ODATA_SEARCH_URL`   | OData search endpoint            |
| `VITE_CDAS_ODATA_DOWNLOAD_URL` | OData download endpoint          |
| `VITE_CDAS_ENCRYPT_SECRET`     | Encryption secret                |
| `VITE_RRD_BASE_URL`            | Rapid Response Desk base URL     |
| `APP_ADMIN_CLIENT_ID`          | Admin scripts only (not browser) |
| `APP_ADMIN_CLIENT_SECRET`      | Admin scripts only (not browser) |
| `APP_ADMIN_AUTH_BASEURL`       | Admin scripts auth endpoint      |

Runtime config is also injected via `global.window.API_ENDPOINT_CONFIG` for deployment flexibility.

## Critical Patterns

### Modal System

All dialogs use Redux modal stack. `ModalId` enum is in `src/const.js`:

```javascript
store.dispatch(modalSlice.actions.addModal({ modal: ModalId.FIS, params: {...} }));
store.dispatch(modalSlice.actions.removeModal());
```

### Event Bubbling with useOutsideClick

Components using `useOutsideClick` will close immediately if the button that opened them doesn't stop propagation:

```javascript
onClick={(e) => {
  e.stopPropagation(); // Required when parent has useOutsideClick
  openModal();
}}
```

### Component Migration

- **New components**: TypeScript (`.tsx`), functional with hooks — follow `src/components/` patterns
- **Legacy**: Class components in `src/Controls/` — refactor to functional only when touching them
- **CLMS datasets**: Remove `legend` property when `datasourceId` contains `"CLMS"`

## GitLab Issues

Always end issue descriptions with the following CC line:

```
/cc @daniel.thiex /cc @gustav.rensburg /cc @zan.pecovnik /cc @jordi.sabat
```

## GitLab Merge Requests

When creating an MR with `glab mr create`, always:

- Pass `--squash-before-merge` to enable squash on merge
- Pass `--remove-source-branch` to delete the source branch after merge
- Pass `--assignee <username>` set to the user who is creating the MR
- Leave reviewer unset (do not pass `--reviewer`)

The MR title must follow GitLab's convention: `Resolve "<issue title>"` (e.g. `Resolve "Clean up dead code in search.js"`).

Example:

```bash
glab mr create --title "Resolve \"<issue title>\"" --description "..." --squash-before-merge --remove-source-branch --assignee <your-gitlab-username>
```

## Agents

- **MR reviews**: Always use the `code-changes-reviewer` agent (via the Agent tool) when asked to review a merge request — never handle it inline yourself.
