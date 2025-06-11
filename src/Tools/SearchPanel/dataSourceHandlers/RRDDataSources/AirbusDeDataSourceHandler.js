import AbstractRRDDataSourceHandler from './AbstractRRDDataSourceHandler';
import { DATASOURCES } from '../../../../const';
import { RRD_CONSTELLATIONS } from '../../../RapidResponseDesk/rapidResponseProperties';
import { ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP } from '../../../RapidResponseDesk/rollingArchiveMap';

export default class AirbusDeDataSourceHandler extends AbstractRRDDataSourceHandler {
  datasource = DATASOURCES.RRD_AIRBUS_DE;

  KNOWN_COLLECTIONS = Object.values(
    ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP[RRD_CONSTELLATIONS.AIRBUS_DE],
  );

  searchGroupLabel = 'Airbus DE';
}
