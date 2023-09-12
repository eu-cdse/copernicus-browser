import { t } from 'ttag';

export const DEFAULT_THEMES = [
  {
    name: () => t`Default`,
    id: 'DEFAULT-THEME',
    content: [
      {
        name: 'Sentinel-1 EW HH',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/6fead8-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-1 EW HH+HV',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/6e3529-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-1 IW VV',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/dea335-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-1 IW VV+VH',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/ea8206-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-1 SM HH',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/d40367-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-1 SM HH+HV',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/e84bda-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-1 SM VV',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/a994bc-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-1 SM VV+VH',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/f1c110-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-2 L1C',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/274a99-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-2 L2A',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/a91f72-YOUR-INSTANCEID-HERE',
        preselected: true,
      },
      {
        name: 'Sentinel-3 OLCI',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/4b010c-YOUR-INSTANCEID-HERE',
        preselected: true,
      },
      {
        name: 'Sentinel-3 SLSTR',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/ef19b6-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-5P O3 / NO2 / ...',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'DEM COPERNICUS_30',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/b001a3-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'DEM COPERNICUS_90',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/7a91ca-YOUR-INSTANCEID-HERE',
      },
      {
        name: 'Sentinel-2 Mosaics',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/65330d-YOUR-INSTANCEID-HERE',
        preselected: true,
      },
    ],
  },
];
