import { ACCESS_ROLES } from '../../../../api/OData/assets/accessRoles';

const COMMON_ACCESS_RIGHTS = {
  DOWNLOAD_PRODUCT_ROLES: [ACCESS_ROLES.LANDSAT_ACCESS],
};

export const LANDSAT_ACCESS_RIGHTS = {
  'Landsat-8': COMMON_ACCESS_RIGHTS,
  'Landsat-9': COMMON_ACCESS_RIGHTS,
};
