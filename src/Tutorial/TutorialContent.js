import React from 'react';
import ReactMarkdown from 'react-markdown/with-html';
import { t } from 'ttag';

export const tutorialStyles = {
  options: {
    zIndex: 10000,
  },
  beacon: {
    display: 'none',
  },
};

export const localeNames = {
  next: () => (
    <span title={t`Next`}>
      {t`Next`} <i className="fa fa-angle-double-right" />
    </span>
  ),
  back: () => (
    <span title={t`Previous`}>
      <i className="fa fa-angle-double-left" /> {t`Previous`}
    </span>
  ),
  last: () => (
    <span title={t`End tutorial`}>
      {t`End tutorial`} <i className="fa fa-close" />
    </span>
  ),
  skip: () => (
    <span title={t`Close`}>
      {t`Close`} <i className="fa fa-step-close" />
    </span>
  ),
  close: () => (
    <span title={t`Close and don't show again`}>
      {t`Close and don't show again`} <i className="fa fa-close" />
    </span>
  ),
};

const welcomeMd = () => t`# Welcome To EO Browser!

A complete archive of Sentinel-1, Sentinel-2, Sentinel-3, Sentinel-5P, ESA’s  
archive of Landsat 5, 7 and 8, global coverage of Landsat 8, Envisat Meris,  
MODIS, Proba-V and GIBS products in one place.

[EO Browser presentation page](https://www.sentinel-hub.com/explore/eobrowser/)  
[EO Browser user guide](https://www.sentinel-hub.com/explore/eobrowser/user-guide/)`;

const overviewMd = () => t`#### Quick overview of EO Browser features

EO Browser combines a complete archive of Sentinel-1, Sentinel-2, Sentinel-3, Sentinel-5P, ESA’s archive of Landsat 5, 7 and 8, global coverage of Landsat 8, Envisat Meris, MODIS, Proba-V and GIBS products in one place and makes it possible to browse and compare full resolution images from those sources. You simply go to your area of interest, select data sources, time range and cloud coverage, and inspect the resulting data.

You can continue the tutorial by clicking on the "Next" button or you can close it. By clicking the info icon <span style="background-color: rgb(25, 26, 37); color: rgb(238, 238, 238); padding: 4px 10px;"><i class="fa fa-info" /></span> in the top right corner you can always resume the tutorial in case you closed it by mistake or because you wanted to try things.
`;

const userAccountMd = () => t`
**Logged-in users** can use their custom themes, save and load pins, create a pin story, measure distances, create a
timelapse and use the advanced image download.

To create a free account simply click [here]
or within the app on **Login** and then "Sign Up".
`;

const visualizationtabMd = () => t`
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
`;

const comparetabMd = () => t`

In the **Compare** tab you will find all visualizations that you added via <i ClassName="fas fa-exchange-alt" /> to **Compare**. 

There are two modes:
  - **Opacity** (Draw opacity slider left or right to fade between compared images)
  - **Split** (Draw split slider left or right to set the boundary between compared images)

You can add all pins to the compare panel using <i className="fa fa-plus-square" /> **Add all pins** or remove all visualizations
 from the **Compare** tab with the <i className="fa fa-trash" /> **Remove all** button.
`;

const pinstabMd = () => t`
The **Pins** tab contains your pinned (favourite/saved) items. Pinned items contain information
about location, data source and its specific layer, zoom level and time.

For each pin you have several options on how to interact with a single pin:

- Change **order** - by clicking on the move icon
<span style="display: inline-flex; padding-top: 0.05em;">
  <i class="fa fa-ellipsis-v"/>
  <i class="fa fa-ellipsis-v"/>
</span> 
in the top left corner of the pin and dragging the pin up or down the list.
- **Rename** - by clicking on the pencil icon <i className="fa fa-pencil" /> next to the pin's name.
- Add to the **Compare** tab - by clicking on the compare icon <i ClassName="fas fa-exchange-alt" />
- Enter a **description** - by clicking on the expand icon <i className="fa fa-angle-double-down " />.
- **Remove** - by clicking the remove icon <i className="fa fa-trash" />.
- **Zoom** to the pin's location - by clicking on the Lat/Lon.

In the line above all pins you have different options that apply for all pins:
 - Create your own story from pins - by clicking on <i class="fa fa-film"> **Story**.
 - Share your pins with others via a link - by clicking on <i className="fas fa-share-alt"> **Share**.
 - Export pins as a JSON file - by clicking on  <i class="fa fa-cloud-download" /> **Export**.
 - Import pins from a JSON file - by clicking on  <i class="fa fa-cloud-upload" /> **Import**.
 - Delete all pins - by clicking on  <i class="fa fa-trash" /> **Clear**.
`;

const searchPlacesMd =
  () => t` Search for a location either by scrolling the map with a mouse or enter the location in the search
field.`;

const overlaysMd = () => t`
Here you can select which base layer and overlays (roads, borders, labels) are shown on the map.
`;

const modesMd = () => t`
Here you can switch between the **normal** and the **education** mode. The **education** mode offers you a slightly simplified version of the app.
It can also be accessed directly via its [dedicated URL](https://apps.sentinel-hub.com/eo-browser-education/).
`;

const tutorialMd = () => t`
You can view the tutorial anytime by clicking on this info icon
<span style="background-color: #191a25; color: #eee; padding: 4px 10px">
  <i className="fa fa-info" />
</span>.
`;

const aoiMd = () => t`
This tool allows you to draw a polygon on the map and display the polygon's size.

All layers that return a single value (such as NDVI, Moisture index, NDWI,…) support viewing the
 index for the selected area over time. Clicking the chart icon  <i class="fa fa-bar-chart" /> will
 display the charts. You can remove the polygon by clicking the remove icon <i class="fa fa-close" />.

 You can also upload a KML/KMZ, GPX, WKT (in EPSG:4326) or GEOJSON/JSON file with a polygon geometry.
 
The two sheets icon <i class="far fa-copy" /> lets you copy the polygon coordinates as a GEOJSON, the crosshair <i className="fa fa-crosshairs" />
 centres the map to the drawn polygon.

Exported images will be cropped to the area of interest in analytical downloads.
`;

const poiMd = () => t`
With this tool, you can mark a point on the map.

  You can also view statistical data for some layers by clicking on the chart icon
  <i class="fa fa-bar-chart" />. 
  You can remove the mark by clicking the remove icon <i class="fa fa-close" />.
</p>
`;

const measurementMd = () => t`
With this tool, you can measure distances and areas on the map.

Every mouse click creates a new point on the path. To stop adding points, press <code>Esc</code>  key
or double click on the map.  
You can remove the measurement by clicking the remove icon <i class="fa fa-close" />.
`;

const downloadImageMd = () => t`
With this tool, you can download an image of visualized data for the displayed location. You can choose
to show captions and you can add your own description.
By enabling Analytical mode, you can choose between various image formats, image resolutions and
coordinate systems. You can also select multiple layers and download them as a <code>.zip</code>  file.

Click the download button
<span class="btn" style="font-size: 12px; padding: 4px 6px 4px 6px"><i className="fa fa-download" />Download</span>
and your image(s) will begin to download. The process can take a few seconds, depending on the selected
resolution and the number of selected layers.

Before downloading, you can define an area of interest (AOI) by clicking on the Area selection tool
icon. Your data will be clipped to match this area.
`;

const timelapseMd = () => t`
With this tool, you can create a timelapse animation of the visualised layer and displayed location.

First, choose a time range. You can refine your search results further by filtering them by months
(filter by months checkbox) and/or selecting one image per defined period (orbit, day, week, month,
year).

Then press <span class="btn" style="font-size: 12px; padding: 4px 6px 4px 6px"> <i className="fa fa-search" /> Search </span> and select your images.
You can select all by checking the checkbox or filter the images by cloud coverage by moving the slider. Or you can pick images one by
one by scrolling through the list and selecting them. Via the **Borders** checkbox, you can enable/disable the borders on your image.

You can preview the timelapse by pressing the play button on the bottom. You can also set the speed
(frames per second).

When you are satisfied with the result, click the download button and the timelapse will be
downloaded as a <code>.gif</code> file.
`;

const happyBrowsingMd = () => t`

You have reached the end of the tutorial. If you have any other questions, feel free to ask us on [the forum](https://forum.sentinel-hub.com/)
or contact us [via email](mailto:info@sentinel-hub.com?Subject=EO%20Browser%20Feedback).


If you want to view the tutorial in the future you can always view it by clicking the info icon
<span style="background-color: #191a25; color: #eee; padding: 4px 10px">
  <i className="fa fa-info" />
</span>
in the top right corner.
`;

const mobileMd = () => t`
#### Quick overview of EO Browser features

If you have a small screen, please go [here](https://www.sentinel-hub.com/explore/eobrowser/user-guide/) to view our user guide.

You can always view this info again by clicking the info icon
<span style="background-color: #191a25, color: #eee, padding: 4px 10px">
  <i class="fa fa-info" />
</span>
in the top right corner.

#### Other resources
- [EO Browser presentation page](https://www.sentinel-hub.com/explore/eobrowser/)
- [EO Browser Summer 2018 updates - video](https://www.youtube.com/embed/m3pron0C0kE)
`;
/* STEPS */
export const TUTORIAL_STEPS = () => [
  {
    content: (
      <div className="content-div-style" style={{ textAlign: 'center', paddingBottom: '40px' }}>
        <ReactMarkdown source={welcomeMd()} />
      </div>
    ),
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },

  {
    title: t`What Is EO Browser?`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={overviewMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`User Account`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          source={userAccountMd()}
          escapeHtml={false}
          linkTarget="_blank"
          transformLinkUri={() =>
            `${process.env.REACT_APP_AUTH_BASEURL}oauth/subscription?origin=EOBrowser&param_client_id=${process.env.REACT_APP_CLIENTID}`
          }
        />
      </div>
    ),
    target: '.user-panel',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Visualize Tab`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={visualizationtabMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '#visualization-tabButton',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Compare Tab`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={comparetabMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '#CompareTabButton',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Pins Tab`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={pinstabMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '#pins-tabButton',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Search Places`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={searchPlacesMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '#location-search-box',
    placement: 'bottom',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },

  {
    title: t`Layers And Overlays`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={overlaysMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '.leaflet-control-layers-toggle',
    placement: 'bottom',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Education Mode`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={modesMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '.mode-selection',
    placement: 'bottom',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },

  {
    title: t`Information And Tutorial`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={tutorialMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '#infoButton',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Draw Area Of Interest`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={aoiMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '.aoiPanel',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Mark Point Of Interest`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={poiMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '.poiPanel',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Measure Distances`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={measurementMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '.measurePanel',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Download Image`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={downloadImageMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '.img-download-btn-wrapper',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Create Timelapse Animation`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={timelapseMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: '.timelapsePanelButton',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Happy Browsing!`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={happyBrowsingMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
];

export const TUTORIAL_STEPS_MOBILE = () => [
  {
    title: t`Welcome To EO Browser!`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown source={mobileMd()} escapeHtml={false} linkTarget="_blank" />
      </div>
    ),
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    styles: {
      options: {
        zIndex: 10000,
      },
      tooltipTitle: {
        paddingBottom: '0',
      },
      tooltipContent: {
        paddingTop: '0',
      },
    },
    locale: localeNames,
  },
];
