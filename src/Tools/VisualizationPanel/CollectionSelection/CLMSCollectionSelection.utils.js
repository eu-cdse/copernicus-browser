import { AttributeConsolidationPeriodValues } from '../../../api/OData/assets/attributes';
import {
  COPERNICUS_CLMS_BURNT_AREA_DAILY,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY,
  COPERNICUS_CLMS_DMP_1KM_10DAILY,
  COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_LAI_1KM_10DAILY,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_LAI_300M_10DAILY,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT0,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT1,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT2,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT6,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_SWI_12_5KM_10DAILY,
  COPERNICUS_CLMS_SWI_12_5KM_DAILY,
  COPERNICUS_CLMS_SWI_1KM_DAILY,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT5,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_LST_5KM_10DAILY_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_V2,
  COPERNICUS_CLMS_NDVI_1KM_STATS_V2,
  COPERNICUS_CLMS_NDVI_1KM_STATS_V3,
  COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V1,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V2,
  COPERNICUS_CLMS_SSM_1KM_DAILY_V1,
  COPERNICUS_CLMS_LSP_300M_YEARLY_V1,
  COPERNICUS_CLMS_LSP_300M_YEARLY_V2,
  COPERNICUS_CLMS_LCC_100M_YEARLY_V3,
  COPERNICUS_CLMS_LST_5KM_HOURLY_V1,
  COPERNICUS_CLMS_LST_5KM_HOURLY_V2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6,
  COPERNICUS_CLMS_WB_300M_10DAILY_V1,
  COPERNICUS_CLMS_WB_1KM_10DAILY_V2,
  COPERNICUS_CLMS_SWE_5KM_DAILY_V1,
  COPERNICUS_CLMS_SWE_5KM_DAILY_V2,
  COPERNICUS_CLMS_SCE_EUROPE_500M_DAILY_V1,
  COPERNICUS_CLMS_SCE_NH_1KM_DAILY_V1,
  COPERNICUS_CLMS_WB_300M_MONTHLY_V2,
  COPERNICUS_CLMS_LIE_500M_DAILY_V1,
  COPERNICUS_CLMS_LIE_250M_DAILY_V2,
  COPERNICUS_CLMS_WB_100M_MONTHLY_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1,
  COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1,
  COPERNICUS_CLMS_LCM_10M_YEARLY_V1,
  COPERNICUS_CLMS_TCD_10M_YEARLY_V1,
  COPERNICUS_CLMS_LIE_500M_DAILY_V2,
  COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4,
  COPERNICUS_CLMS_SWI_1KM_DAILY_V2,
  COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4,
  COPERNICUS_CLMS_BURNT_AREA_DAILY_V4,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4,
  COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1,
  COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1,
  COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V3,
  COPERNICUS_CLMS_LSWT_NRT_GLOBAL_1KM_10DAILY_V1,
  COPERNICUS_CLMS_LSWT_OFFLINE_1KM_10DAILY_V1,
  COPERNICUS_CLMS_SCE_GLOBAL_1KM_DAILY_V1,
  COPERNICUS_CLMS_LWQ_NRT_GLOBAL_100M_10DAILY_V2,
  COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT0,
  COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT1,
  COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT2,
  COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT6,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT0,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT1,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT2,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT6,
} from '../../SearchPanel/dataSourceHandlers/dataSourceConstants';

export const DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX = 0;

export const CLMS_OPTIONS = [
  {
    label: 'CLMS Land Cover and Land Use Mapping',
    id: 'CLMS Land Cover and Land Use Mapping',
    options: [
      {
        label: 'Dynamic Land Cover',
        id: 'Dynamic Land Cover',
        options: [
          { label: 'clms_global_lcc_100m_v3_yearly_geotiff', id: COPERNICUS_CLMS_LCC_100M_YEARLY_V3 },
          { label: 'lcm_global_10m_yearly_v1', id: COPERNICUS_CLMS_LCM_10M_YEARLY_V1 },
          { label: 'tcd_pantropical_10m_yearly_v1', id: COPERNICUS_CLMS_TCD_10M_YEARLY_V1 },
        ],
      },
      // { label: 'CORINE Land Cover', id: 'CORINE Land Cover' },
      // { label: 'CLC + Backbone', id: 'CLC + Backbone' },
      // { label: 'High Resolution Layer', id: 'High Resolution Layer' },
    ],
  },
  // {
  //   label: 'CLMS Priority Area Monitoring',
  //   id: 'CLMS Priority Area Monitoring',
  //   options: [
  //     { label: 'Coastal Zones', id: 'Coastal Zones' },
  //     { label: 'N2K', id: 'N2K' },
  //     { label: 'Riperian Zones', id: 'Riperian Zones' },
  //     { label: 'Urban Atlas', id: 'Urban Atlas' },
  //     {
  //       label: 'Reference Land Cover and Land Cover Change in selected Hot Spots',
  //       id: 'Reference Land Cover and Land Cover Change in selected Hot Spots',
  //     },
  //   ],
  // },
  {
    label: 'CLMS Bio-geophysical Parameters',
    id: 'CLMS Bio-geophysical Parameters',
    options: [
      {
        label: 'Evapotranspiration',
        id: 'Evapotranspiration',
        options: [
          {
            label: 'clms_global_eta_300m_v1_10daily_geotiff',
            id: COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1,
          },
          { label: 'clms_global_hf_300m_v1_daily_geotiff', id: COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1 },
        ],
      },
      {
        label: 'Snow',
        id: 'Snow',
        options: [
          {
            label: 'Snow Cover Extent',
            id: 'Snow Cover Extent',
            options: [
              {
                label: 'clms_global_sce_500m_v1_daily_geotiff',
                id: COPERNICUS_CLMS_SCE_EUROPE_500M_DAILY_V1,
              },
              { label: 'clms_nh_sce_1km_v1_daily_geotiff', id: COPERNICUS_CLMS_SCE_NH_1KM_DAILY_V1 },
              { label: 'sce_global_1km_daily_v1', id: COPERNICUS_CLMS_SCE_GLOBAL_1KM_DAILY_V1 },
            ],
          },

          // { label: 'Snow State', id: 'Snow State 1' },
          // { label: 'Snow State', id: 'Snow State 2' },
          {
            label: 'Snow Water Equivalent',
            id: 'Snow Water Equivalent',
            options: [
              { label: 'clms_global_swe_5km_v1_daily_geotiff', id: COPERNICUS_CLMS_SWE_5KM_DAILY_V1 },
              { label: 'clms_global_swe_5km_v2_daily_geotiff', id: COPERNICUS_CLMS_SWE_5KM_DAILY_V2 },
            ],
          },
        ],
      },
      {
        label: 'Soil Moisture',
        id: 'Soil Moisture',
        options: [
          {
            label: 'Soil Water Index',
            id: 'Soil Water Index',
            options: [
              // { label: 'swi-timeseries_global_12.5km_daily', id: 'swi-timeseries_global_12.5km_daily' },
              // { label: 'swi-static_global_12.5km_daily', id: 'swi-static_global_12.5km_daily' },
              { label: 'clms_europe_swi_1km_v3_daily_geotiff', id: COPERNICUS_CLMS_SWI_1KM_DAILY },
              { label: 'swi_europe_1km_daily_v2_geotiff', id: COPERNICUS_CLMS_SWI_1KM_DAILY_V2 },
              { label: 'clms_global_swi_12.5km_v3_daily_geotiff', id: COPERNICUS_CLMS_SWI_12_5KM_DAILY },
              { label: 'clms_global_swi_12.5km_v3_10daily_geotiff', id: COPERNICUS_CLMS_SWI_12_5KM_10DAILY },
              { label: 'swi_global_12.5km_daily_v4_geotiff', id: COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4 },
              { label: 'swi_global_12.5km_10daily_v4_geotiff', id: COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4 },
            ],
          },
          {
            label: 'Surface Soil Moisture',
            id: 'Surface Soil Moisture',
            options: [{ label: 'ssm_europe_1km_daily', id: COPERNICUS_CLMS_SSM_1KM_DAILY_V1 }],
          },
        ],
      },
      {
        label: 'Temperature and Reflectance',
        id: 'Temperature and Reflectance',
        options: [
          {
            label: 'Land Surface Temperature',
            id: 'Land Surface Temperature',
            options: [
              { label: 'clms_global_lst_5km_v1_hourly_geotiff', id: COPERNICUS_CLMS_LST_5KM_HOURLY_V1 },
              { label: 'clms_global_lst_5km_v2_hourly_geotiff', id: COPERNICUS_CLMS_LST_5KM_HOURLY_V2 },
              { label: 'lst-tci_global_5km_10daily_v1', id: COPERNICUS_CLMS_LST_5KM_10DAILY_V1 },
              { label: 'lst-tci_global_5km_10daily_v2', id: COPERNICUS_CLMS_LST_5KM_10DAILY_V2 },
              {
                label: 'clms_global_lst_5km_v1_10daily-daily-cycle_geotiff',
                id: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1,
              },
              {
                label: 'clms_global_lst_5km_v2_10daily-daily-cycle_geotiff',
                id: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2,
              },
            ],
          },
          {
            label: 'Lake Surface Water Temperature',
            id: 'Lake Surface Water Temperature',
            options: [
              { label: 'lswt-offline_global_1km_10daily', id: COPERNICUS_CLMS_LSWT_OFFLINE_1KM_10DAILY_V1 },
              { label: 'lswt-nrt_global_1km_10daily', id: COPERNICUS_CLMS_LSWT_NRT_GLOBAL_1KM_10DAILY_V1 },
            ],
          },
          // {
          //   label: 'Top of Canopy Reflectances',
          //   id: 'Top of Canopy Reflectances',
          //   options: [{ label: 'toc_global_300m_daily', id: 'toc_global_300m_daily' }],
          // },
        ],
      },
      {
        label: 'Vegetation',
        id: 'Vegetation',
        options: [
          {
            label: 'Burnt Area',
            id: 'Burnt Area',
            options: [
              { label: 'ba_global_300m_daily', id: COPERNICUS_CLMS_BURNT_AREA_DAILY },
              { label: 'ba_global_300m_monthly', id: COPERNICUS_CLMS_BURNT_AREA_MONTHLY },
              { label: 'ba_global_300m_daily_v4', id: COPERNICUS_CLMS_BURNT_AREA_DAILY_V4 },
              { label: 'ba_global_300m_monthly_v4', id: COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4 },
            ],
          },
          {
            label: 'Dry/Gross Dry Matter Productivity',
            id: 'Dry/Gross Dry Matter Productivity',
            options: [
              {
                label: 'clms_global_dmp_300m_v1_10daily_geotiff_RT0',
                id: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
                consolidationPeriods: [
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_DMP_300M_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_DMP_300M_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT5.label,
                    id: COPERNICUS_CLMS_DMP_300M_10DAILY_RT5,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_DMP_300M_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_dmp_1km_v2_10daily_geotiff',
                id: COPERNICUS_CLMS_DMP_1KM_10DAILY,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_DMP_1KM_10DAILY,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_gdmp_300m_v1_10daily_geotiff_RT0',
                id: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0,
                consolidationPeriods: [
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT5.label,
                    id: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_gdmp_1km_v2_10daily_geotiff',
                id: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6,
                  },
                ],
              },
            ],
          },
          {
            label: 'Net/Gross Primary Production',
            id: 'Net/Gross Primary Production',
            options: [
              {
                label: 'clms_global_npp_300m_v1_10daily_geotiff_RT0',
                id: COPERNICUS_CLMS_NPP_300M_10DAILY_RT0,
                consolidationPeriods: [
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_NPP_300M_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_NPP_300M_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_NPP_300M_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_NPP_300M_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_gpp_300m_v1_10daily_geotiff_RT0',
                id: COPERNICUS_CLMS_GPP_300M_10DAILY_RT0,
                consolidationPeriods: [
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_GPP_300M_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_GPP_300M_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_GPP_300M_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_GPP_300M_10DAILY_RT6,
                  },
                ],
              },
            ],
          },
          {
            label: 'Vegetation Indices',
            id: 'Vegetation Indices',
            options: [
              {
                label: 'ndvi_global_300m_10daily_v1',
                id: COPERNICUS_CLMS_NDVI_300M_10DAILY_V1,
              },
              {
                label: 'ndvi_global_300m_10daily_v2',
                id: COPERNICUS_CLMS_NDVI_300M_10DAILY_V2,
              },
              {
                label: 'ndvi_global_300m_10daily_v3',
                id: COPERNICUS_CLMS_NDVI_300M_10DAILY_V3,
              },
              {
                label: 'ndvi_global_1km_10daily_v2',
                id: COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2,
              },
              {
                label: 'ndvi_global_1km_10daily_v3',
                id: COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
              },
              {
                label: 'ndvi_global_lst_1km_v2',
                id: COPERNICUS_CLMS_NDVI_1KM_STATS_V2,
              },
              {
                label: 'ndvi_global_lst_1km_v3',
                id: COPERNICUS_CLMS_NDVI_1KM_STATS_V3,
              },
              // { label: 'ndvi_global_1km_10daily', id: 'ndvi_global_1km_10daily 2' },
              // { label: 'ndvi_global_300m_10daily', id: 'ndvi_global_300m_10daily 1' },
              // { label: 'ndvi_global_300m_10daily', id: 'ndvi_global_300m_10daily 2' },
              // {
              //   label: 'ndvi-sts-2015-2019_global_1km_10daily',
              //   id: 'ndvi-sts-2015-2019_global_1km_10daily 1',
              // },
              // {
              //   label: 'ndvi-sts-2015-2019_global_1km_10daily',
              //   id: 'ndvi-sts-2015-2019_global_1km_10daily 2',
              // },
              // { label: 'ndvi-lts-1997-2017_global_1km_10daily', id: 'ndvi-lts-1997-2017_global_1km_10daily' },
            ],
          },
          // { label: 'Vegetation Seasonal Trajectories', id: 'Vegetation Seasonal Trajectories' },
          {
            label: 'Vegetation Phenology and Productivity Parameters',
            id: 'Vegetation Phenology and Productivity Parameters',
            options: [
              {
                label: 'lsp_global_300m_yearly_v1',
                id: COPERNICUS_CLMS_LSP_300M_YEARLY_V1,
              },
              {
                label: 'lsp_global_300m_yearly_v2',
                id: COPERNICUS_CLMS_LSP_300M_YEARLY_V2,
              },
            ],
          },
          {
            label: 'Vegetation Properties',
            id: 'Vegetation Properties',
            options: [
              {
                label: 'clms_global_fapar_300m_v1_10daily_geotiff',
                id: COPERNICUS_CLMS_FAPAR_300M_10DAILY,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_fapar_300m_v2_10daily_geotiff',
                id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT0,
                consolidationPeriods: [
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_fapar_1km_v2_10daily_geotiff',
                id: COPERNICUS_CLMS_FAPAR_1KM_10DAILY,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_FAPAR_1KM_10DAILY,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_fcover_300m_v1_10daily_geotiff',
                id: COPERNICUS_CLMS_FCOVER_300M_10DAILY,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_FCOVER_300M_10DAILY,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_fcover_1km_v2_10daily_geotiff',
                id: COPERNICUS_CLMS_FCOVER_1KM_10DAILY,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_FCOVER_1KM_10DAILY,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_lai_300m_v1_10daily_geotiff',
                id: COPERNICUS_CLMS_LAI_300M_10DAILY,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_LAI_300M_10DAILY,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_LAI_300M_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_LAI_300M_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_LAI_300M_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_LAI_300M_10DAILY_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_lai_300m_v2_10daily_geotiff',
                id: COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT0,
                consolidationPeriods: [
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_LAI_GLOBAL_300M_10DAILY_V2_RT6,
                  },
                ],
              },
              {
                label: 'clms_global_lai_1km_v2_10daily_geotiff',
                id: COPERNICUS_CLMS_LAI_1KM_10DAILY,
                consolidationPeriods: [
                  {
                    label: 'None',
                    id: COPERNICUS_CLMS_LAI_1KM_10DAILY,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT0.label,
                    id: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT1.label,
                    id: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT2.label,
                    id: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2,
                  },
                  {
                    label: AttributeConsolidationPeriodValues.RT6.label,
                    id: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Water Bodies',
        id: 'Water Bodies 1',
        options: [
          {
            label: 'Lake Water Quality',
            id: 'Lake Water Quality',
            options: [
              {
                label: 'clms_global_lwq_100m_v1_10daily-nrt_geotiff',
                id: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1,
              },
              {
                label: 'clms_global_lwq_100m_v2_10daily-nrt_geotiff',
                id: COPERNICUS_CLMS_LWQ_NRT_GLOBAL_100M_10DAILY_V2,
              },
              {
                label: 'clms_global_lwq_300m_v1_10daily-nrt_geotiff',
                id: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1,
              },
              {
                label: 'clms_global_lwq_300m_v2_10daily-nrt_geotiff',
                id: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2,
              },
              {
                label: 'clms_global_lwq_300m_v1_10daily-reproc_geotiff',
                id: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1,
              },
            ],
          },
          {
            label: 'River and Lake Ice Extent',
            id: 'River and Lake Ice Extent',
            options: [
              // { label: 'lie-agg_europe_vector_daily', id: 'lie-agg_europe_vector_daily' },
              { label: 'lie_baltic_250m_daily_v1', id: COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1 },
              { label: 'clms_global_lie_250m_v2_daily_geotiff', id: COPERNICUS_CLMS_LIE_250M_DAILY_V2 },
              { label: 'clms_global_lie_500m_v1_daily_geotiff', id: COPERNICUS_CLMS_LIE_500M_DAILY_V1 },
              { label: 'clms_global_lie_500m_v2_daily_geotiff', id: COPERNICUS_CLMS_LIE_500M_DAILY_V2 },
            ],
          },
          // {
          //   label: 'River and Lake Water Level',
          //   id: 'River and Lake Water Level',
          //   options: [
          //     { label: 'wl-lakes_global_vector_daily', id: 'wl-lakes_global_vector_daily' },
          //     { label: 'wl-rivers_global_vector_daily', id: 'wl-rivers_global_vector_daily' },
          //   ],
          // },
          {
            label: 'Water Bodies',
            id: 'Water Bodies 2',
            options: [
              { label: 'clms_global_wb_100m_v1_monthly_geotiff', id: COPERNICUS_CLMS_WB_100M_MONTHLY_V1 },
              { label: 'clms_global_wb_300m_v2_monthly_geotiff', id: COPERNICUS_CLMS_WB_300M_MONTHLY_V2 },
              { label: 'clms_global_wb_300m_v1_10daily_geotiff', id: COPERNICUS_CLMS_WB_300M_10DAILY_V1 },
              { label: 'clms_global_wb_1km_v2_10daily_geotiff', id: COPERNICUS_CLMS_WB_1KM_10DAILY_V2 },
            ],
          },
        ],
      },
    ],
  },
];

export const flattenCLMSOptionsWithParent = (options, parentPath) => {
  const arr = options.map((opt) => {
    if (opt.options) {
      return flattenCLMSOptionsWithParent(opt.options, opt.id);
    }
    return { ...opt, parentPath: parentPath };
  });

  return arr.flat();
};
