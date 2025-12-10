import { t } from 'ttag';
import { InstructionNamesRRD } from '../../rapidResponseProperties';

export const sectionAttributes = {
  summary: ['id', 'constellation', 'platform', 'name', 'description'],
};

const stacCatalogMetadataFormatMap = {
  id: () => t`Id`,
  constellation: () => t`Constellation`,
  datetime: () => t`Sensing time`,
  resolution_class: () => t`Resolution class`,
  end_datetime: () => t`Sensing End`,
  gsd: () => t`Ground sampling distance`,
  instrument: () => t`Instrument`,
  platform: () => t`Platform`,
  providers: () => t`Providers`,
  [InstructionNamesRRD.InstrumentMode]: () => t`Instrument mode`,
  [InstructionNamesRRD.Polarizations]: () => t`Polarizations`,
  start_datetime: () => t`Sensing Start`,
  aoi_cover: () => t`AOI coverage`,
  [InstructionNamesRRD.CloudCover]: () => t`Cloud cover`,
  name: () => t`Name`,
  description: () => t`Description`,
  [InstructionNamesRRD.SunAzimuth]: () => t`Sun azimuth`,
  [InstructionNamesRRD.SunElevation]: () => t`Sun elevation`,
  instrument_mode: () => t`Instrument Mode`,
  'view:off_nadir': () => t`Off nadir angle`,
  [InstructionNamesRRD.IncidenceAngle]: () => t`Incidence angle`,
  metadata_source: () => t`Metadata source`,
  'sar:pixel_spacing_range': () => t`Pixel spacing range`,
  [InstructionNamesRRD.OrbitState]: () => t`Orbit direction`,
  [InstructionNamesRRD.Azimuth]: () => t`Azimuth`,
  'product:type': () => t`Product Type`,
  sat_elevation: () => t`Satellite elevation`,
  roles: () => t`Roles`,
  url: () => 'Url',
  'sar:frequency_band': () => t`Frequency band`,
  mission: () => t`Mission`,
  'proj:code': () => 'CRS',
  'sar:center_frequency': () => t`Center frequency`,
  'sar:looks_azimuth': () => t`Looks azimuth`,
  'sar:looks_range': () => t`Looks range`,
  'sar:observation_direction': () => t`Observation direction`,
  'sar:resolution_azimuth': () => t`Resolution azimuth`,
  'sar:resolution_range': () => t`Resolution range`,
  'sat:absolute_orbit': () => t`Absolute orbit`,
  'sat:platform_international_designator': () => t`Platform international designator`,
  'sat:relative_orbit': () => t`Relative orbit`,
  best_prod_resolution: () => t`Best product resolution`,
  resolution: () => t`Resolution`,
  spectralBand: () => t`Spectral band`,
  'sar:pixel_spacing_azimuth': () => t`Pixel spacing azimuth`,
  'ra:archiving_date': () => t`Archiving date`,
};

function formatNames(name) {
  const nameKey = stacCatalogMetadataFormatMap[name];
  if (nameKey !== undefined) {
    return nameKey();
  }
  return name;
}

const UNSUPPORTED_ATTRIBUTES = ['eo:bands', 'start_datetime'];

const ATTRIBUTES_ORDER = [
  'instrument',
  'metadata_source',
  'resolution_class',
  'sar:instrument_mode',
  'product:type',
  'spectralBand',
  'resolution',
  'datetime',
  'end_datetime',
  'aoi_cover',
  'eo:cloud_cover',
  'view:off_nadir',
  'view:incidence_angle',
  'sat_elevation',
  'view:sun_azimuth',
  'view:sun_elevation',
  'view:azimuth',
  'sat:orbit_state',
  'sar:polarizations',
];

export const getAllProductAttributes = (product, metadataSource) => {
  const allAttributes = [
    ...product
      ?.filter((attr) => !UNSUPPORTED_ATTRIBUTES.includes(attr.name))
      .map((attr) => {
        return {
          key: attr.name,
          value: attr.value,
        };
      }),
  ].map(({ key, value }) => ({
    key: key,
    name: formatNames(key),
    value:
      value === null || value === undefined
        ? value
        : typeof value === 'number'
        ? value.toFixed(2)
        : `${value}`,
  }));

  const sortedAttributes = allAttributes.sort((a, b) => {
    const indexA = ATTRIBUTES_ORDER.indexOf(a.key);
    const indexB = ATTRIBUTES_ORDER.indexOf(b.key);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    if (indexA !== -1) {
      return -1;
    }
    if (indexB !== -1) {
      return 1;
    }

    return 0;
  });

  return sortedAttributes;
};
