# Copernicus Browser — Deep Linking

The Copernicus Browser can be opened directly to a specific location, dataset, visualisation and date by passing query string parameters on `https://browser.dataspace.copernicus.eu/`. This page documents every parameter the app reads from the URL on load, so links can be built programmatically (for example by an AI assistant or a script) and shared.

None of the parameters are required, and any combination may be used. Parameters not recognized by the app are ignored. (Legacy links that pass parameters after a `#` instead of a `?` are also read, for backwards compatibility with an older version of the Browser — new links should always use `?`.)

**A malformed value for any parameter marked JSON or JSON array below stops the app from loading entirely** (it fails while parsing the URL, before anything renders) — for example, `orthorectification` needs its value quoted as JSON (`orthorectification=%22COPERNICUS_30%22`), not the bare string `COPERNICUS_30`. Two exceptions: a malformed `terrainViewerSettings` is ignored rather than blocking the load, and malformed `comparedOpacity`/`comparedClipping` show an error notification instead. A `processGraph` that doesn't decode to valid JSON also crashes the app, but only once the map tries to render it, not while parsing the URL. A malformed `evalscript` or `evalscriptUrl` only produces a broken visualisation, not a blank app.

## Location

| Parameter | Format | Default | Notes |
|---|---|---|---|
| `lat` | float | `50.16282` | Values outside `-90`–`90` reset both `lat` and `lng` to the default. |
| `lng` | float | `20.78613` | Values outside `-180`–`180` reset both `lat` and `lng` to the default. |
| `zoom` | integer | `5` | Not validated or clamped. |

## Time

| Parameter | Format | Default | Notes |
|---|---|---|---|
| `fromTime` | ISO-8601 date-time | none | Parsed as UTC. |
| `toTime` | ISO-8601 date-time | none | Parsed as UTC. |
| `dateMode` | `SINGLE`, `MOSAIC`, `TIME RANGE` (note the literal space) | `SINGLE` | With `dateMode=TIME RANGE`, a range longer than 180 days is silently clamped: `fromTime` is replaced with the start of the day 180 days before `toTime`. |

## Dataset and layer

| Parameter | Format | Notes |
|---|---|---|
| `datasetId` | string, e.g. `S2_L2A_CDAS` | Selects the dataset/collection. |
| `layerId` | string, e.g. `1_TRUE_COLOR` | Selects a preset layer/visualisation for the dataset. |

## Visualisation URL — omit this

| Parameter | Format | Notes |
|---|---|---|
| `visualizationUrl` | normally omitted | The app encrypts this value with a deploy-time secret whenever it writes a share link, so a hand-built plaintext value can't reproduce one. **For programmatically built links, omit `visualizationUrl` entirely** — when `datasetId` is set, the app automatically fills it in with the correct visualisation URL for that dataset, overwriting any value that isn't one of that dataset's own registered URLs. A value that doesn't start with `https` is run through decryption and can stop the app from loading if it isn't a valid encrypted value (see the warning above). |

## Custom scripts

| Parameter | Format | Notes |
|---|---|---|
| `evalscript` | base64 (UTF-8 safe) | A Sentinel Hub evalscript. Setting this selects the "Custom script" visualisation. |
| `evalscriptUrl` | base64, or a plain `http(s)://` URL | An externally hosted evalscript. If the app can fetch it, its content replaces `evalscript`; otherwise the URL is kept and resolved server-side. Legacy lowercase alias: `evalscripturl`. |
| `processGraph` | base64-encoded JSON | An openEO process graph. Forces openEO-based processing. |
| `processGraphUrl` | base64-encoded `http(s)://` URL (base64 only — a plain URL is not accepted here) | An externally hosted process graph. Legacy lowercase alias: `processgraphurl`. The app fetches this URL eagerly on load; if it's unreachable or doesn't return valid JSON, the app fails to load entirely (same failure mode as the warning above) — double-check it resolves before sharing a link built with it. |

Only one of these is needed. When both an inline value and its `*Url` counterpart are present, the `*Url` variant is preferred.

## Effects

| Parameter | Format | Default (omit to use) |
|---|---|---|
| `gain` | float | `1` |
| `gamma` | float | `1` |
| `redRange` / `greenRange` / `blueRange` | JSON array `[min,max]` | `[0,1]` |

## Processing options

| Parameter | Format | Notes |
|---|---|---|
| `minQa` | integer | |
| `mosaickingOrder` | `mostRecent` \| `leastRecent` \| `leastCC` | |
| `upsampling` / `downsampling` | `BILINEAR` \| `BICUBIC` \| `LANCZOS` \| `BOX` \| `NEAREST` | |
| `speckleFilter` | JSON, e.g. `{"type":"LEE","windowSizeX":5,"windowSizeY":5}` | `type` is `NONE` or `LEE`. |
| `orthorectification` | JSON string, e.g. `"COPERNICUS_30"` | One of `DISABLED`, `MAPZEN`, `COPERNICUS`, `COPERNICUS_30`, `COPERNICUS_90`. |
| `demSource3D` | JSON string, e.g. `"MAPZEN"` | One of `MAPZEN`, `COPERNICUS_30`, `COPERNICUS_90`, `NASA_ASTER_GDEM`. |
| `backscatterCoeff` | JSON string | One of `BETA0`, `GAMMA0_ELLIPSOID`, `SIGMA0_ELLIPSOID`, `GAMMA0_TERRAIN`. |
| `orbitDirection` | JSON string | `ASCENDING` or `DESCENDING`. |
| `cloudCoverage` | number, `0`–`100` | |
| `dataFusion` | JSON | Only applied when a custom script (`evalscript`/`evalscriptUrl`) is selected and it isn't empty. |
| `handlePositions` / `gradient` | comma-separated lists | Only applied when both are present together. |

## Theme

| Parameter | Format | Notes |
|---|---|---|
| `themeId` | string, e.g. `AGRICULTURE` | Selects an app theme. |
| `themesUrl` | URL | Loads a custom themes configuration. |

## Panels and compare

| Parameter | Format | Notes |
|---|---|---|
| `panel` | `layers` \| `highlights` \| `pins` \| `wms` | Which Visualise sub-panel opens on load. If omitted, the panel is Layers — unless the selected theme has highlights configured, in which case Highlights opens instead. `pins`/`highlights` land with the data collections view collapsed; `wms` lands with it force-expanded. Written automatically as the user switches panels, so it survives a reload or a login redirect. |
| `compareShare` | any non-empty value | Opens the Compare panel (not available in 3D view). Pass `compareSharedPinsId` as well to also restore its compared layers; without it, Compare opens empty. |
| `compareSharedPinsId` | shared-pins list id | Restores a shared pins list as compared layers. **Requires `comparedOpacity` and `comparedClipping` to also be present** — without them, restoring the layers fails with an error. |
| `compareMode` | `split` \| `opacity` | Defaults to `split`. |
| `comparedOpacity` | JSON array, one entry per compared layer | See `compareSharedPinsId`. |
| `comparedClipping` | JSON array, one entry per compared layer | See `compareSharedPinsId`. |

## Timelapse and 3D

| Parameter | Format | Notes |
|---|---|---|
| `timelapse` | JSON | Opens the Timelapse modal with the given settings. |
| `timelapseSharePreviewMode` | JSON (boolean) | Only used together with `timelapse`. |
| `previewFileUrl` | URL | Only used together with `timelapse`. |
| `terrainViewerSettings` | JSON | Opens the 3D terrain viewer with the given settings. Only has an effect when the 3D module is enabled for the deployment. |

## CLMS

| Parameter | Format |
|---|---|
| `clmsSelectedPath` | string |
| `clmsSelectedCollection` | string |
| `clmsSelectedConsolidationPeriodIndex` | integer |

## Miscellaneous

| Parameter | Format | Notes |
|---|---|---|
| `useEvoland` | `true` / `false` | |
| `shouldDisplayTutorial` | `true` | Shows the onboarding tutorial on load. |
| `sticker` | `active` | Enables sticker mode in Image Download. Preserved on the URL if present on load; not otherwise generated by the app. |
| `sharedPinsListId` | shared-pins list id | **Read-only / one-time import.** On load, the app strips this parameter from the URL right away (this is deliberate — see the code comment above `updatePath` in `src/utils/index.js` for why), then asks for confirmation and imports the list, opening the Pins panel. The app never writes it back, so it's fine for a one-off share link but won't reappear in a URL copied from the address bar afterwards. |

## Examples

1. **Location only**

   `https://browser.dataspace.copernicus.eu/?zoom=12&lat=15.2875&lng=42.84874`

2. **Dataset, layer and a single date**

   `https://browser.dataspace.copernicus.eu/?zoom=11&lat=45.35625&lng=8.45879&themeId=DEFAULT-THEME&datasetId=S2_L2A_CDAS&layerId=1_TRUE_COLOR&toTime=2026-01-03T23%3A59%3A59.999Z&dateMode=SINGLE`

3. **A time range** (180 days or less — a longer range is silently clamped, see the Time section above)

   `https://browser.dataspace.copernicus.eu/?zoom=11&lat=45.35625&lng=8.45879&themeId=DEFAULT-THEME&datasetId=S2_L2A_CDAS&layerId=1_TRUE_COLOR&dateMode=TIME%20RANGE&fromTime=2023-01-01T00%3A00%3A00.000Z&toTime=2023-06-29T23%3A59%3A59.999Z`

4. **A custom evalscript**

   `https://browser.dataspace.copernicus.eu/?zoom=11&lat=45.35625&lng=8.45879&themeId=DEFAULT-THEME&datasetId=S2_L2A_CDAS&evalscript=Ly9WRVJTSU9OPTMKZnVuY3Rpb24gc2V0dXAoKSB7CiAgcmV0dXJuIHsKICAgIGlucHV0OiBbIkIwNCIsIkIwMyIsIkIwMiJdLAogICAgb3V0cHV0OiB7IGJhbmRzOiAzIH0KICB9Owp9CmZ1bmN0aW9uIGV2YWx1YXRlUGl4ZWwoc2FtcGxlKSB7CiAgcmV0dXJuIFsyLjUqc2FtcGxlLkIwNCwgMi41KnNhbXBsZS5CMDMsIDIuNSpzYW1wbGUuQjAyXTsKfQ%3D%3D&dateMode=SINGLE`

5. **A specific theme**

   `https://browser.dataspace.copernicus.eu/?panel=pins&themeId=AGRICULTURE`

6. **A CLMS dataset with processing options**

   `https://browser.dataspace.copernicus.eu/?zoom=7&lat=15.40602&lng=-9.66797&themeId=MONITORING&panel=layers&datasetId=COPERNICUS_CLMS_LST_5KM_HOURLY_V2&layerId=LST&fromTime=2024-04-03T12%3A00%3A00.000Z&toTime=2024-04-03T13%3A59%3A59.999Z&dateMode=TIME%20RANGE&mosaickingOrder=leastRecent&cloudCoverage=30&clmsSelectedPath=COPERNICUS_CLMS_LST_5KM_HOURLY_V2&clmsSelectedCollection=COPERNICUS_CLMS_LST_5KM_HOURLY_V2`

   (`panel=layers` is needed here because the `MONITORING` theme has highlights configured, which would otherwise open the Highlights panel instead of Layers — see the `panel` row above.)
