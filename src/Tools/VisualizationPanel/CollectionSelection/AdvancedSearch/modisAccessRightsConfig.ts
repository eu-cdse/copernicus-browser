import { ACCESS_ROLES } from '../../../../api/OData/assets/accessRoles';

const COMMON_ACCESS_RIGHTS = {
  DOWNLOAD_PRODUCT_ROLES: [ACCESS_ROLES.MODIS_ACCESS],
};

export const MODIS_ACCESS_RIGHTS = {
  MODIS: COMMON_ACCESS_RIGHTS,
};
