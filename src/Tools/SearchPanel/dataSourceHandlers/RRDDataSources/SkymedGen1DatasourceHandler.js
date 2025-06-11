import AbstractRRDDataSourceHandler from './AbstractRRDDataSourceHandler';
import { DATASOURCES } from '../../../../const';
import { ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP } from '../../../RapidResponseDesk/rollingArchiveMap';
import { RRD_CONSTELLATIONS } from '../../../RapidResponseDesk/rapidResponseProperties';

export default class SkymedGen1DatasourceHandler extends AbstractRRDDataSourceHandler {
  datasource = DATASOURCES.RRD_SKYMED_1;

  KNOWN_COLLECTIONS = Object.values(
    ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP[RRD_CONSTELLATIONS.SKYMED_1],
  );

  searchGroupLabel = 'COSMO SkyMed 1st Gen';
}
