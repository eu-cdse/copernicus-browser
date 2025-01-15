import React from 'react';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';

import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../rehypeConfig';

// 4th slide
import Single from '/images/tutorial-icons/single.svg';
import Mosaic from '/images/tutorial-icons/mosaic.svg';
import TimeRange from '/images/tutorial-icons/time-range.svg';
import Layers from '/images/tutorial-icons/Layers.svg';
import Highlights from '/images/tutorial-icons/Highlights.svg';
import Compare from '/images/tutorial-icons/Compare.svg';
import Pins from '/images/tutorial-icons/Pins.svg';

// 5th slide
import LayersActive from '/images/tutorial-icons/Layers-active.svg';
import DoubleChevronDownWhite from '/images/tutorial-icons/double-chevron-down-white.svg';
import CodeWhiteIcon from '/images/tutorial-icons/code-white.svg';
import CompareWithBadge from '/images/tutorial-icons/Compare-badge.svg';
import PinsWithBadge from '/images/tutorial-icons/Pins-badge.svg';

// 6th slide
import HighlightsActive from '/images/tutorial-icons/Highlights-active.svg';

// 7th slide
import CompareActive from '/images/tutorial-icons/Compare-active.svg';

// 8th slide
import PinsActive from '/images/tutorial-icons/Pins-active.svg';
import Pencil from '/images/tutorial-icons/Pencil.svg';

// 9th slide
import WorkspacePlus from '/images/tutorial-icons/Workspace.svg';

// 17th slide
import Polygon from '/images/tutorial-icons/Polygon.svg';

export const tutorialStyles = {
  options: {
    zIndex: 10000,
  },
  beacon: {
    display: 'none',
  },
};

export const tutorialLabels = {
  next: () => t`Next`,
  previous: () => t`Previous`,
  endTutorial: () => t`End tutorial`,
  skip: () => t`Remind me later`,
  close: () => t`Close`,
  dontShowAgain: () => t`Don't show again`,
};

export const localeNames = {
  next: () => (
    <span title={tutorialLabels.next()}>
      <i className="fa fa-angle-right" />
    </span>
  ),
  back: () => (
    <span title={tutorialLabels.previous()}>
      <i className="fa fa-angle-left" />
    </span>
  ),
  last: () => (
    <span title={tutorialLabels.endTutorial()}>
      {tutorialLabels.endTutorial()} <i className="fa fa-close" />
    </span>
  ),
  skip: () => <span title={tutorialLabels.skip()}>{tutorialLabels.skip()}</span>,
  close: () => <span title={tutorialLabels.close()}>{tutorialLabels.close()}</span>,
  dontShowAgain: () => <span title={tutorialLabels.dontShowAgain()}>{tutorialLabels.dontShowAgain()}</span>,
};

const welcomeMd = () => t`# Welcome to Copernicus Browser!

A complete archive of Sentinel-1, Sentinel-2, Sentinel-3, Sentinel-5P, Sentinel-6,  
Copernicus Contributing Missions (Optical, SAR and DEM), and Sentinel-1 and  
Sentinel-2 Global Mosaics in one place.

[About Copernicus Browser page](https://documentation.dataspace.copernicus.eu/Applications/Browser.html)  
[Available data collections](https://dataspace.copernicus.eu/explore-data/data-collections)
`;

const overviewMd = () => t`#### Quick overview of Copernicus Browser features

Copernicus Browser serves as a central hub for accessing, exploring and utilising the wealth of Earth observation and environmental 
data provided by the Sentinel-1, Sentinel-2, Sentinel-3, Sentinel-5P, Sentinel-6, Copernicus Contributing Missions (Optical, SAR and DEM), 
and Sentinel-1 and Sentinel-2 Global Mosaics (see details [here](https://documentation.dataspace.copernicus.eu/Data.html)). You simply 
go to your area of interest, select data sources, time range and cloud coverage, and inspect the resulting data.

You can continue the tutorial by clicking on the "Next" button or you can close it. By clicking the info 
icon <span class="icon large-padding"><i class="fa fa-info"></i></span> in the top right 
corner you can always resume the tutorial in case you closed it by mistake or because you wanted to try something out.
`;

const userAccountMd = () => t`
Anonymous use of the Browser gives you access with limited functionality. To be able to use all functions, you need a free account. 
**Logged-in users** can use their custom themes, save and load pins, measure distances, create a timelapse and use the extended image download.
`;

const visualizationTabMd = () => t`
In the **Visualise tab** you can:
- Search for a **Date**.
- Select a **Theme**.
- Choose a **Collection**.
- Select a **Visualisation Layer**.

You can change the **Date** (type in or select it from the calendar) and set the cloud coverage. You can choose between 
single date, mosaic and time range: ![Single](${Single}) ![Mosaic](${Mosaic}) ![Time Range](${TimeRange}).

The **Configurations** dropdown offers you different preconfigured themes and your own custom configured instances if 
you are logged-in. To create an instance, go to your [personal dashboard](https://shapps.dataspace.copernicus.eu/dashboard/).

You can select a desired data source in the **Data Collections**. You can read explanations of the satellites by clicking 
on the information icon next to the name of the data collection. Here you can also switch between different panels: 
![Layers](${Layers}) Layers, ![Highlights](${Highlights}) Highlights, ![Compare mode](${Compare}) Compare mode and ![Pins](${Pins}) Pins.
`;

const layersPanelMd = () => t`
You can select different pre-installed or custom spectral band combinations to visualise data for the selected result.

Some of the common options:
- **True Color** - Visual interpretation of land cover
- **False Color** - Visual interpretation of vegetation
- **NDVI** - Vegetation index
- **Moisture index** - Moisture index
- **SWIR** - Shortwave-infrared index
- **NDWI** - Normalized Difference Water Index
- **NDSI** - Normalized Difference Snow Index

Most visualisations are given a description and a legend, which you can view by clicking on the expand sign ![expand](${DoubleChevronDownWhite}).
Each of the layers offers an option to add a layer to Compare or Pins by clicking <span class="icon"><i class="fas fa-plus"></i> Add to</span>. 
Based on your action the Compare and Pins panels will include added layers ![compare-with-badge](${CompareWithBadge}) ![pins-with-badge](${PinsWithBadge}) 
which you can further organize and analyse under each tab.

Click on **Custom visualisation** option to select custom band combinations, index combinations or write your own classification script for the
visualisation of data. You can also use custom scripts, which are stored elsewhere, either on Google Drive, GitHub or in our 
[Custom script repository](https://custom-scripts.sentinel-hub.com/). Paste the URL of the script into a text box in advanced script editing panel 
and click Refresh. The custom script of preconfigured layers can be edited by choosing the code icon ![code-icon](${CodeWhiteIcon}).

You can select <span class="icon"><i class="fa fa-sliders"></i></span> **Show effects and advanced options** like the sampling method, advanced RGB effects or apply 
contrast (gain) and luminance (gamma). To return to preconfigured layers, click <span class="icon"><i class="fa fa-paint-brush"></i></span> **Show visualisations**.
**Share** your visualisation on social media by clicking on the share icon <span class="icon"><i class="fas fa-share-alt"></i></span>.
`;

const highlightsPanelMd = () => t`
If you choose one of the preconfigured themes under **Configurations**, you will be able to select from a highlights list under the Highlights panel.

Each highlight has a description accessible under the dropdown icon ![expand-description](${DoubleChevronDownWhite}).
`;

const comparePanelMd = () => t`
Here you will find all visualisations that you added by clicking <span class="icon"><i class="fas fa-plus"></i> Add to</span> on 
the layers under the Layers panel.

There are two modes of comparing:
- **Opacity** (drag opacity slider left or right to fade between compared images)
- **Split** (drag split slider left or right to set the boundary between compared images)
`;

const pinsPanelMd = () => t`
The **Pins** panel contains your pinned (favourite/saved) items. Pinned items contain information about location, data source 
and its specific layer, zoom level and time. To reorder the pins, choose among the options in the **Order by** dropdown.

You have several ways to interact with each pin:
- Change **order** - by clicking on the move icon <span class="icon"><i class="fa fa-ellipsis-v"></i><i class="fa fa-ellipsis-v"></i></span> 
in the top left corner of the pin and dragging the pin up or down the list.
- **Rename** - by clicking on the pencil icon ![rename](${Pencil}) next to the pin's name.
- Add to the **Compare** panel - by clicking on the compare icon ![compare](${Compare})
- Enter a **description** - by clicking on the expand icon ![expand](${DoubleChevronDownWhite}).
- **Remove** - by clicking the remove icon <span class="icon"><i class="fas fa-trash"></i></span>.
- **Zoom** to the pin's location - by clicking on the Lat/Lon.

In the line above your pins, you have different options that apply to all pins:
 - Create your own story from pins - by clicking on **Story**.
 - Share your pins with others via a link - by clicking on **Share**.
 - Export pins as a JSON file - by clicking on **Export**.
 - Import pins from a JSON file - by clicking on **Import**.
 - Delete all pins - by clicking on **Clear**.
`;

const searchTabMd = () => t`
Under **Search** you can set:
- **Search criteria** by a product name.
- Choose from which **data sources** you want to receive the data by selecting checkboxes. Where applicable, you can also set **filters**
such as satellite platform, orbit direction, relative orbit, number, acquisition mode, product availability, timeliness, etc.
- Select the **time range** by either typing the date or select the date from the calendar. If you want to omit some of the months, enable
the **Filter by months** option and uncheck the non-relevant months.

Once you hit Search you get a list of results. Each result is presented with a preview image, and relevant data specific to the data source.
For **product info** and **zooming to product** click on the <span class="icon"><i class="fa fa-info-circle"></i></span> and <span class="icon"><i class="fa fa-crosshairs"></i></span> icon.
If you are logged in, you can click on ![workspace-add](${WorkspacePlus}) to **add a product to your Copernicus Data Space Ecosystem Workspace**
to easily collect and process your satellite data. You can also **download the product** by clicking on the download icon <span class="icon"><i class="fa fa-download"></i></span>.

Clicking on the Visualise button will open the **Visualise** tab for the selected result.
`;

const searchPlacesMd = () => t`
Search for a location either by scrolling the map with a mouse or enter the location in the **Go to Place** field.
`;

const overlaysMd = () => t`
Here you can select which base layer and overlays (roads, borders, labels, contours, water bodies) are shown on the map.
`;

const tutorialMd = () => t`
You can view the tutorial anytime by clicking on this info icon <span class="icon large-padding"><i class="fa fa-info"></i></span>.
`;

const aoiMd = () => t`
This tool allows you to draw a polygon on the map and display the polygon's size.

All layers that return a single value (such as NDVI, Moisture Index, NDWI, ...) support viewing the index
for the selected area over time. Clicking the chart icon <span class="icon"><i class="fa fa-bar-chart"></i></span> will
display the statistical information charts (you need to be logged-in to use this option). You can remove the polygon 
by clicking the remove icon <span class="icon"><i class="fa fa-close"></i></span>.

You can also upload a KML/KMZ, GPX, WKT (in EPSG:4326) or GEOJSON/JSON file with a polygon geometry using the
upload icon <span class="icon"><i class="fa fa-upload"></i></span>.

The two sheets icon <span class="icon"><i class="far fa-copy"></i></span> lets you copy the polygon coordinates as a 
GEOJSON and the crosshair <span class="icon"><i class="fa fa-crosshairs"></i></span> centers the map to the drawn polygon.
`;

const drawLineMd = () => t`
This tool allows you to draw a line on the map and display the line length.

It also includes the **Elevation Profile**, a tool that allows you to create the altitude profile by defining a line from point A to point B.

You can also upload a KML/KMZ, GPX, WKT (in EPSG:4326) or GEOJSON/JSON file using the upload icon <span class="icon"><i class="fa fa-upload"></i></span>.

The two sheets icon <span class="icon"><i class="far fa-copy"></i></span> lets you copy the line coordinates as a 
GEOJSON and the crosshair <span class="icon"><i class="fa fa-crosshairs"></i></span> centers the map to the drawn line.
`;

const poiMd = () => t`
With this tool, you can mark a point on the map.

You can also view statistical data for some layers by clicking on the chart icon <span class="icon"><i class="fa fa-bar-chart"></i></span>. 
You can remove the mark by clicking the remove icon <span class="icon"><i class="fa fa-close"></i></span>.
</p>
`;

const measurementMd = () => t`
With this tool, you can measure distances and areas on the map.

Every mouse click creates a new point on the path. To stop adding points, press <code>Esc</code> key or double click on the map.  
You can remove the measurement by clicking the remove icon <span class="icon"><i class="fa fa-close"></i></span>.
`;

const downloadImageMd = () => t`
With this tool, you can download an image of visualised data for the displayed location. You can choose to show 
captions and you can add your own description. By enabling Analytical mode, you can choose between various image formats, 
image resolutions and coordinate systems. You can also select multiple layers and download them as a <code>.zip</code> file.

Click the download button <span class="icon"><i className="fa fa-download"></i> Download</span> and your image(s) will 
begin to download. The process can take a few seconds, depending on the selected resolution and the number of selected layers.

Before downloading, you can define an area of interest (AOI) by clicking on the Area selection tool icon ![selection](${Polygon}).
Your data will be clipped to match this area.
`;

const timelapseMd = () => t`
With this tool (available to logged-in users), you can create a timelapse animation of the visualised layer and displayed location.

First, choose a time range. You can refine your search results further via the **Filter by months** checkbox and/or selecting one 
image per defined period (orbit, day, week, month, year).

Then press <span class="icon"><i className="fa fa-search"></i> Search</span> and select your images. You can select all 
by checking the checkbox or filter the images by cloud coverage by moving the slider. Or you can pick images one by one by scrolling 
through the list and selecting them. Via the **Borders** checkbox, you can enable/disable the borders on your image.

You can preview the timelapse by pressing the play button <span class="icon"><i className="fas fa-play-circle"></i></span>, set the speed (frames per second)
and transition mode, all available on the bottom of the screen. See additional settings by clicking the 
settings icon <span class="icon"><i className="fas fa-cogs"></i></span>.

When you are satisfied with the result, click the download button and the timelapse will be downloaded as a <code>.gif</code> or <code>.mp4</code> file.
`;

const visualize3dMd = () => t`
This tool allows you to navigate and fly through terrain effortlessly.

You can make use of the 3D Feature by utilising the following tools:
  - Use **Vertical Terrain Scaling** to make flatter areas appear more dynamic
  - Stimulate the Sun movements and its projected shadows at any time of the day
  - Manipulate the **Shadow Parameters**
    - Shadow visibility
    - Shadow rendering distance
    - Shadow map size visibility
  - Control the ambient, diffuse and specular factors as well as specular power
  - Use the **Anaglyph Stereo Mode** to create two distinct red and blue images to produce a single 3D stereo image
`;

const histogramMd = () => t`
This tool allows you to calculate and display statistical data (the distribution of values) for specific layers.

It is calculated for the data within your AOI (if defined) or otherwise for the whole screen.

You can hover over the bars in the histogram to read the values and determine thresholds to distinguish between different spectral signatures.

This tool currently only works for index layers (e.g. the NDVI).
`;

const happyBrowsingMd = () => t`
You have reached the end of the tutorial. If you have any other questions, feel free to ask us on 
[our forum](https://forum.dataspace.copernicus.eu/) or [submit a request](https://helpcenter.dataspace.copernicus.eu/hc/en-gb/requests/new).

If you would like to view the tutorial in the future, you can always access it by clicking the info 
icon <span class="icon large-padding"><i class="fa fa-info"></i></span> in the top right corner.
`;

const mobileMd = () => t`
#### Quick overview of Copernicus Browser features

If you have a small screen, please go [here](https://documentation.dataspace.copernicus.eu/Applications/Browser.html) to view our user guide.

You can always view this info again by clicking the info icon <span class="icon large-padding"><i class="fa fa-info"></i></span> in the top right corner.

#### Other resources
- [Available data collections](https://dataspace.copernicus.eu/explore-data/data-collections)
`;
/* STEPS */
export const TUTORIAL_STEPS = () => [
  {
    content: (
      <div className="content-div-style" style={{ textAlign: 'center', paddingBottom: '40px' }}>
        <ReactMarkdown
          children={welcomeMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`About Copernicus Browser`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={overviewMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
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
          children={userAccountMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
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
    title: t`Visualise Tab`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={visualizationTabMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#visualization-tabButton',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: `![active-layers](${LayersActive}) ${t`Layers Panel`}`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={layersPanelMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#layers-panel-button',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: `![active-highlights](${HighlightsActive}) ${t`Highlights Panel`}`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={highlightsPanelMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#highlights-panel-button',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: `![active-compare](${CompareActive}) ${t`Compare Panel`}`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={comparePanelMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#compare-panel-button',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: `![active-pins](${PinsActive}) ${t`Pins Panel`}`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={pinsPanelMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#pins-panel-button',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Search Tab`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={searchTabMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#search-tabButton',
    placement: 'right',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Search Places`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={searchPlacesMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#location-search-box',
    placement: 'bottom',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Basemaps and Overlays`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={overlaysMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '.leaflet-control-layers-toggle',
    placement: 'bottom',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Information and Tutorial`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={tutorialMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '#infoButton',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Draw Area of Interest`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown children={aoiMd()} rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS} linkTarget="_blank" />
      </div>
    ),
    target: '.aoiPanel',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Draw a Line`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={drawLineMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '.loiPanel',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Mark Point of Interest`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown children={poiMd()} rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS} linkTarget="_blank" />
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
        <ReactMarkdown
          children={measurementMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
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
        <ReactMarkdown
          children={downloadImageMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
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
        <ReactMarkdown
          children={timelapseMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '.timelapsePanelButton',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Visualise Terrain in 3D`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={visualize3dMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '.terrain-viewer-button',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Histogram`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={histogramMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </div>
    ),
    target: '.histogram-button-wrapper',
    placement: 'left',
    disableBeacon: true,
    styles: tutorialStyles,
    locale: localeNames,
  },
  {
    title: t`Happy Browsing!`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={happyBrowsingMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
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
    title: t`Welcome To Copernicus Browser!`,
    content: (
      <div className="content-div-style">
        <ReactMarkdown
          children={mobileMd()}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
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
