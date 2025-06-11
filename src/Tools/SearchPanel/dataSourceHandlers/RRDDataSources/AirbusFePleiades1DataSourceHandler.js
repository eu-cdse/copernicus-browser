import AbstractRRDDataSourceHandler from './AbstractRRDDataSourceHandler';
import { DATASOURCES } from '../../../../const';
import { ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP } from '../../../RapidResponseDesk/rollingArchiveMap';
import { RRD_CONSTELLATIONS } from '../../../RapidResponseDesk/rapidResponseProperties';

export default class AirbusFePleiades1DataSourceHandler extends AbstractRRDDataSourceHandler {
  datasource = DATASOURCES.RRD_AIRBUS_FE_PLEIADAS;

  KNOWN_COLLECTIONS = Object.values(
    ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP[RRD_CONSTELLATIONS.AIRBUS_FE_PLEIADAS],
  );

  searchGroupLabel = 'Pléiades-1A/B';
}
