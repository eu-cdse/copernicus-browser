import { TPDICollections } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

export const TPDI_PROVIDER_ORDER_WARNINGS = {
  [TPDICollections.AIRBUS_PLEIADES]: null,
  [TPDICollections.AIRBUS_SPOT]: null,
  [TPDICollections.PLANET_SCOPE]: null,
  [TPDICollections.MAXAR_WORLDVIEW]: null,
  [TPDICollections.PLANET_SKYSAT]: t`The minimum area for ordering SkySat data is 25 km². This means that you will be charged 25 km² even for AOIs smaller than 25 km²!`,
};

export const PLANET_SKYSAT_MIN_ORDER_SIZE = 25;
