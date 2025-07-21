import AbstractRRDDataSourceHandler from './AbstractRRDDataSourceHandler';
import { DATASOURCES } from '../../../../const';
import { ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP } from '../../../RapidResponseDesk/rollingArchiveMap';
import { RRD_CONSTELLATIONS } from '../../../RapidResponseDesk/rapidResponseProperties';

export default class GHGSatDatasourceHandler extends AbstractRRDDataSourceHandler {
  datasource = DATASOURCES.RRD_GHGSAT;

  KNOWN_COLLECTIONS = Object.values(
    ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP[RRD_CONSTELLATIONS.GHGSAT],
  );

  searchGroupLabel = 'GHGSat';
}
