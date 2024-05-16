import { t, ngettext, msgid } from 'ttag';

t`Discover`;
t`No tile found`;
t`Dataset`;
t`Show`;
t`Manage configuration instances`;
t`Zoom in to view data`;
t`
In the <b>Visualize</b> tab you can select different pre-installed or custom spectral band combinations to visualise data for the selected result.

Some of the common options:
  - **True Color** - Visual interpretation of land cover.
  - **False Color** - Visual interpretation of vegetation.
  - **NDVI** - Vegetation index.
  - **Moisture index** - Moisture index
  - **SWIR** - Shortwave-infrared index.
  - **NDWI** - Normalized Difference Water Index.
  - **NDSI** - Normalized Difference Snow Index.

Most visualizations are given a description and a legend, which you can view by clicking on the expand
icon <i className="fa fa-angle-double-down " />.
   
For most data sources the **Custom Script** option is available. Click on it to select custom
band combinations, index combinations or write your own classification script for the visualisation of data. You can also
use custom scripts, which are stored elsewhere, either on Google drive, GitHub or in our [Custom script repository](https://custom-scripts.sentinel-hub.com/). 
Paste the URL of the script into a text box in the advanced script editing panel and click Refresh.
   
You can change the date directly in the <b>Visualize</b> tab, without going back to the **Discover** tab. Type in or select it from the calendar <i className="fa fa-calendar cal-icon-cal" />.

Above the visualizations you have on line of additional tools. Note that their avalibilty depends on the data source.
  - **Pin layer** to save it in the application for future use - by clicking on the pin icon <i className="fa fa-thumb-tack" />.
  - Select **advanced options** like the sampling method or apply different **effects** such as contrast (gain) and luminance (gamma) - by clicking on the effect sliders icon <i className="fa fa-sliders" />.
  - Add a layer to the **Compare** tab for later comparison - by clicking on the compare icon <i ClassName="fas fa-exchange-alt" />.
  - **Zoom** to the centre of the tile - by clicking on the crosshair <i className="fa fa-crosshairs" />.
  - Toggle **layer visibility** - by clicking on the visibility icon <i className="fa fa-eye-slash" />.
  - **Share** your visualization on social media - by clicking on the share icon <i className="fas fa-share-alt" />.
`;
t`Zoom to tile`;
t`Hide layer`;
t`Show layer`;
t`Discover Tab`;
t`

In the **Discover** tab you can:

 - Select a **Theme.**
 - **Search** for data.
 - View theme **Highlights.**

The **Theme** dropdown offers you different preconfigured themes as well as your own custom configured instances if you are Logged-in. To create an instance, click on
the settings icon <i className="fa fa-cog" /> and log in with the same credentials as you used for EO Browser.
 
Under **Search** you can set search criteria:
  - Choose from which satellites you want to receive the data by selecting checkboxes.
  - Select additional options where applicable, for example, cloud coverage with the slider.
  - Select the time range by either typing the date or select the date from the calendar.

You can read explanations of satellites by clicking on the question icon
<i className="fa fa-question-circle" /> next to the data source name.

Once you hit <span class="btn" style="font-size: 12px; padding: 4px 6px 4px 6px">Search</span> you get a list of results. Each result is presented 
with a preview image, and relevant data specific to the datasource. For some data sources, the link icon <i class="fa fa-link" /> is also visible for each result.
Clicking on it reveals direct links to the raw image of the result on EO Cloud or SciHub. Clicking on the <span class="btn" style="font-size: 12px; padding: 4px 6px 4px 6px">Visualize</span> button will open the **Visualize** tab for the selected result.

Under **Highlight**, you find preselected interesting locations connected to the selected theme.
`;
t`Hello,`;
t`Show visualization`;
t`DEM source`;
t`Commercial Data`;
t`Data source name`;
t`Cloud coverage`;
t`Sun elevation`;
t`MGRS location`;
t`AWS path`;
t`EO Cloud path`;
t`CreoDIAS path`;
t`SciHub link`;
t`Sensing date`;
t`Sensing time`;
t`Advanced`;
t`Show tutorial`;
t`Location`;
t`DEM instance`;
t`Type`;
t`Currently only collections on services.sentinel-hub are supported.`;
t`Free sign up`;
t`for all features`;
t`Powered by`;
t`with contributions by`;
t`L2A (atmospherically corrected)`;
t`Results`;
t`More information`;
t`Orthorectification creates a planimetrically correct image. Specify the DEM used for Orthorectification process here.`;
t`Measurement values returned will be in the chosen backscatter coefficient. Radiometric terrain correction can be enabled by setting the Backscatter coefficient to gamma0_terrain; in this case orthorectification will be enabled using the DEM selected under Orthorectification.`;
t`Timespan`;
t`Close and don't show again`;
t`Previous`;
t`End tutorial`;
t`Next`;
t`Continue with tutorial`;
t`Close and don't show again`;
t`Don't show again`;
t`Back to search`;
t`Powered by`;
// If the following translation is added again, the second link must be updated
t`# True color composite\n\nSensors carried by satellites can image Earth in different regions of the electromagnetic spectrum. Each region in the spectrum is referred to as a band. Sentinel-2 has 13 bands. True color composite uses visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a natural colored product, that is a good representation of the Earth as humans would see it naturally.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/true_color/) and [here.](http://www.fis.uni-bonn.de/en/recherchetools/infobox/professionals/remote-sensing-systems/spectroscopy).`;
t`Add to compare`;
t`Time range [UTC]`;
t`
**Sentinel-2** provides high-resolution images in the visible and infrared wavelengths, to monitor vegetation, soil and water cover, inland waterways and coastal areas. .

**Spatial resolution:** 10m, 20m, and 60m, depending on the wavelength (that is, only details bigger than 10m, 20m, and 60m can be seen). More info [here](https://sentinel.esa.int/web/sentinel/user-guides/sentinel-2-msi/resolutions/spatial). 

**Revisit time:** maximum 5 days to revisit the same area, using both satellites.

**Data availability:** Since June 2015. Full global coverage since March 2017.

**Common usage:** Land-cover maps, land-change detection maps, vegetation monitoring, monitoring of burnt areas.`;
// Translations have to be added with their Plural forms as we otherwise lose the Plurals when updating the terms which crashes the app.
ngettext(
  msgid`Showing ${this.state.results.length} result`,
  `Showing ${this.state.results.length} results`,
  this.state.results.length,
);
ngettext(
  msgid`Showing ${this.state.selectedTiles.length} result.`,
  `Showing ${this.state.selectedTiles.length} results.`,
  this.state.selectedTiles.length,
);
t`split`;
t`opacity`;
t`Timespan:`;
t`hh`;
t`mm`;
t`Commercial data`;
t`DatasetId`;
t`Title`;
t`No layers found for date`;
t`Based on: `;
t`Based on the last band of the custom script.`;
// eslint-disable-next-line
const fisLayerNotAvailableErrorMsg = (props) =>
  t`not available for "${props.presetLayerName}" (layer with value is not set up)`;
t`Powered by Sentinel Hub`;
t`This configuration has no highlights.`;
t`Please select a configuration.`;
t`Highlights of the Month`;
