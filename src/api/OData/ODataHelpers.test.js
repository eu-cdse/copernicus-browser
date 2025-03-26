import moment from 'moment';
import * as wellknown from 'wellknown';

import oDataHelpers, {
  SUPPORTED_PROPERTIES,
  checkAllInstrumentsInCollectionSupport,
  checkAllProductsInCollectionSupport,
  checkAllProductsInInstrumentSupport,
  checkInstrumentSupports,
  checkProductTypeSupports,
  findCollectionConfigById,
  findInstrumentConfigById,
  findProductTypeConfigById,
  roundGeometryValues,
} from './ODataHelpers';
import {
  AttributeNames,
  AttributeOriginValues,
  AttributeProcessorVersionValues,
  AttributeS2CollectionValues,
  ODataAttributes,
} from './assets/attributes';
import { FilterElement } from './FilterElement';
import { ODataFilterOperator } from './ODataTypes';

describe('findCollectionConfigById', () => {
  test('S1', () => {
    const collection = findCollectionConfigById('S1');
    expect(collection.id).toEqual('S1');
    expect(collection.instruments).toBeDefined();
    expect(collection.instruments.length).toBeGreaterThan(0);
  });

  test('S2', () => {
    const collection = findCollectionConfigById('S2');
    expect(collection.id).toEqual('S2');
    expect(collection.instruments).toBeDefined();
    expect(collection.instruments.length).toBeGreaterThan(0);
  });

  test('S3', () => {
    const collection = findCollectionConfigById('S3');
    expect(collection.id).toEqual('S3');
    expect(collection.instruments).toBeDefined();
    expect(collection.instruments.length).toBeGreaterThan(0);
  });

  test('OPTICAL', () => {
    const collection = findCollectionConfigById('OPTICAL');
    expect(collection.id).toEqual('OPTICAL');
    expect(collection.instruments).toBeDefined();
    expect(collection.instruments.length).toBeGreaterThan(0);
  });

  test('DEM', () => {
    const collection = findCollectionConfigById('DEM');
    expect(collection.id).toEqual('DEM');
    expect(collection.instruments).toBeDefined();
    expect(collection.instruments.length).toBeGreaterThan(0);
  });

  test('CCM_SAR', () => {
    const collection = findCollectionConfigById('CCM_SAR');
    expect(collection.id).toEqual('CCM_SAR');
    expect(collection.instruments).toBeDefined();
    expect(collection.instruments.length).toBeGreaterThan(0);
  });
});

describe('findInstrumentConfigById', () => {
  test('SAR', () => {
    const instrument = findInstrumentConfigById('SAR');
    expect(instrument.id).toEqual('SAR');
    expect(instrument.productTypes).toBeDefined();
    expect(instrument.productTypes.length).toBeGreaterThan(0);
  });

  test('MSI', () => {
    const instrument = findInstrumentConfigById('MSI');
    expect(instrument.id).toEqual('MSI');
    expect(instrument.productTypes).toBeDefined();
    expect(instrument.productTypes.length).toBeGreaterThan(0);
  });

  test('VHR Europe', () => {
    const instrument = findInstrumentConfigById('VHR_EUROPE');
    expect(instrument.id).toEqual('VHR_EUROPE');
    expect(instrument.productTypes).toBeDefined();
    expect(instrument.productTypes.length).toBeGreaterThan(0);
  });

  test('VHR Urban Atlas', () => {
    const instrument = findInstrumentConfigById('VHR_URBAN_ATLAS');
    expect(instrument.id).toEqual('VHR_URBAN_ATLAS');
    expect(instrument.productTypes).toBeDefined();
    expect(instrument.productTypes.length).toBeGreaterThan(0);
  });

  test('HR-MR', () => {
    const instrument = findInstrumentConfigById('HR-MR');
    expect(instrument.id).toEqual('HR-MR');
    expect(instrument.productTypes).toBeDefined();
    expect(instrument.productTypes.length).toBeGreaterThan(0);
  });
});

describe('findProductTypeConfigById', () => {
  test('GRD', () => {
    const productType = findProductTypeConfigById('GRD');
    expect(productType.id).toEqual('GRD');
    expect(productType.label).toBeDefined();
  });

  test('RAW', () => {
    const productType = findProductTypeConfigById('RAW');
    expect(productType.id).toEqual('RAW');
    expect(productType.label).toBeDefined();
  });

  test('L1B_RA_BD1', () => {
    const productType = findProductTypeConfigById('L1B_RA_BD1');
    expect(productType.id).toEqual('L1B_RA_BD1');
    expect(productType.label).toBeDefined();
  });

  test('L1B_IR_SIR', () => {
    const productType = findProductTypeConfigById('L1B_IR_SIR');
    expect(productType.id).toEqual('L1B_IR_SIR');
    expect(productType.label).toBeDefined();
  });

  test('SR_2_LAN___', () => {
    const productType = findProductTypeConfigById('SR_2_LAN___');
    expect(productType.id).toEqual('SR_2_LAN___');
    expect(productType.label).toBeDefined();
  });

  test('DAP_MG2b_01', () => {
    const productType = findProductTypeConfigById('DAP_MG2b_01');
    expect(productType.id).toEqual('DAP_MG2b_01');
    expect(productType.label).toBeDefined();
  });

  test('VHR_IMAGE_2018', () => {
    const productType = findProductTypeConfigById('VHR_IMAGE_2018');
    expect(productType.id).toEqual('VHR_IMAGE_2018');
    expect(productType.label).toBeDefined();
  });

  test('VHR_IMAGE_2021', () => {
    const productType = findProductTypeConfigById('VHR_IMAGE_2021');
    expect(productType.id).toEqual('VHR_IMAGE_2021');
    expect(productType.label).toBeDefined();
  });

  test('DAP_MG2-3_01', () => {
    const productType = findProductTypeConfigById('DAP_MG2-3_01');
    expect(productType.id).toEqual('DAP_MG2-3_01');
    expect(productType.label).toBeDefined();
  });

  test('DWH_MG2_CORE_01', () => {
    const productType = findProductTypeConfigById('DWH_MG2_CORE_01');
    expect(productType.id).toEqual('DWH_MG2_CORE_01');
    expect(productType.label).toBeDefined();
  });

  test('HR_IMAGE_2015', () => {
    const productType = findProductTypeConfigById('HR_IMAGE_2015');
    expect(productType.id).toEqual('HR_IMAGE_2015');
    expect(productType.label).toBeDefined();
  });

  test('EUR_HR2_MULTITEMP', () => {
    const productType = findProductTypeConfigById('EUR_HR2_MULTITEMP');
    expect(productType.id).toEqual('EUR_HR2_MULTITEMP');
    expect(productType.label).toBeDefined();
  });

  test('MR_IMAGE_2015', () => {
    const productType = findProductTypeConfigById('MR_IMAGE_2015');
    expect(productType.id).toEqual('MR_IMAGE_2015');
    expect(productType.label).toBeDefined();
  });

  test('DWH_MG2-3_CORE_08', () => {
    const productType = findProductTypeConfigById('DWH_MG2-3_CORE_08');
    expect(productType.id).toEqual('DWH_MG2-3_CORE_08');
    expect(productType.label).toBeDefined();
  });

  test('DWH_MG1_CORE_11', () => {
    const productType = findProductTypeConfigById('DWH_MG1_CORE_11');
    expect(productType.id).toEqual('DWH_MG1_CORE_11');
    expect(productType.label).toBeDefined();
  });

  test.each([
    ['COP-DEM_EEA-10-DGED'],
    ['COP-DEM_EEA-10-INSP'],
    ['COP-DEM_GLO-30-DGED'],
    ['COP-DEM_GLO-30-DTED'],
    ['COP-DEM_GLO-90-DGED'],
    ['COP-DEM_GLO-90-DTED'],
  ])('Dem %p', (id) => {
    const productType = findProductTypeConfigById(id);
    expect(productType.id).toEqual(id);
    expect(productType.label).toBeDefined();
  });
});

describe('checkInstrumentSupports', () => {
  test('SAR InstrumentName', () => {
    const sg = checkInstrumentSupports('SAR', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeTruthy();
  });

  test('MSI InstrumentName', () => {
    const sg = checkInstrumentSupports('MSI', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeTruthy();
  });

  test('TROPOMI InstrumentName', () => {
    const sg = checkInstrumentSupports('TROPOMI', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeTruthy();
  });

  test('VHR Europe InstrumentName', () => {
    const sg = checkInstrumentSupports('VHR_EUROPE', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('VHR Urban Atlas InstrumentName', () => {
    const sg = checkInstrumentSupports('VHR_URBAN_ATLAS', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('HR Europe InstrumentName', () => {
    const sg = checkInstrumentSupports('HR_EUROPE', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('MR Europe InstrumentName', () => {
    const sg = checkInstrumentSupports('MR_EUROPE', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('HR-MR InstrumentName', () => {
    const sg = checkInstrumentSupports('HR-MR', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test.each([
    ['S1AuxiliaryFiles', SUPPORTED_PROPERTIES.InstrumentName],
    ['S2AuxiliaryFiles', SUPPORTED_PROPERTIES.InstrumentName],
    ['S3AuxiliaryFiles', SUPPORTED_PROPERTIES.InstrumentName],
    ['S5PAuxiliaryFiles', SUPPORTED_PROPERTIES.InstrumentName],
  ])('AuxiliaryFiles InstrumentName %p', (instrumentName, supportedProperty) => {
    const sg = checkInstrumentSupports(instrumentName, supportedProperty);
    expect(sg).toBeFalsy();
  });
});

describe('check customFilterQueryByDatasetFull supports', () => {
  test.each([
    ['COP-DEM_EEA-10-DGED'],
    ['COP-DEM_EEA-10-INSP'],
    ['COP-DEM_GLO-30-DGED'],
    ['COP-DEM_GLO-30-DTED'],
    ['COP-DEM_GLO-90-DGED'],
    ['COP-DEM_GLO-90-DTED'],
  ])('Dem %p', (id) => {
    const { customFilterQueryByDatasetFull } = findProductTypeConfigById(id);
    expect(customFilterQueryByDatasetFull).toBeTruthy();
  });
});

describe('checkAllInstrumentsInCollectionSupport', () => {
  test('S2 InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('S2', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('S5P InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('S5P', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('OPTICAL InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('OPTICAL', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('DEM InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('DEM', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('CCM_SAR InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('CCM_SAR', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });
});

describe('checkProductsSupport ', () => {
  test.each([
    'DAP_MG2b_01',
    'VHR1-2_Urban_Atlas_2012',
    'DWH_MG2b_CORE_03',
    'VHR_IMAGE_2015',
    'VHR_IMAGE_2018',
    'VHR_IMAGE_2021',
    'DAP_MG2-3_01',
    'DWH_MG2_CORE_01',
    'HR_IMAGE_2015',
    'EUR_HR2_MULTITEMP',
    'MR_IMAGE_2015',
    'DWH_MG2-3_CORE_08',
    'DWH_MG1_CORE_11',
  ])(`customFilterQueryByDatasetFull`, (id) => {
    const { customFilterQueryByDatasetFull } = findProductTypeConfigById(id);
    expect(customFilterQueryByDatasetFull).toBeTruthy();
  });
});

describe('checkProductTypeSupports', () => {
  test('GRD Geometry', () => {
    const sg = checkProductTypeSupports('GRD', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('RAW Geometry', () => {
    const sg = checkProductTypeSupports('RAW', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('DAP_MG2b_01 Geometry', () => {
    const sg = checkProductTypeSupports('DAP_MG2b_01', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('VHR_IMAGE_2018 Geometry', () => {
    const sg = checkProductTypeSupports('VHR_IMAGE_2018', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('VHR_IMAGE_2021 Geometry', () => {
    const sg = checkProductTypeSupports('VHR_IMAGE_2021', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('DAP_MG2-3_01 Geometry', () => {
    const sg = checkProductTypeSupports('DAP_MG2-3_01', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('DWH_MG2_CORE_01 Geometry', () => {
    const sg = checkProductTypeSupports('DWH_MG2_CORE_01', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('HR_IMAGE_2015 Geometry', () => {
    const sg = checkProductTypeSupports('HR_IMAGE_2015', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('EUR_HR2_MULTITEMP Geometry', () => {
    const sg = checkProductTypeSupports('EUR_HR2_MULTITEMP', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('MR_IMAGE_2015 Geometry', () => {
    const sg = checkProductTypeSupports('MR_IMAGE_2015', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('DWH_MG2-3_CORE_08 Geometry', () => {
    const sg = checkProductTypeSupports('DWH_MG2-3_CORE_08', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('DWH_MG1_CORE_11 Geometry', () => {
    const sg = checkProductTypeSupports('DWH_MG1_CORE_11', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('L1B_IR_SIR Geometry', () => {
    const sg = checkProductTypeSupports('L1B_IR_SIR', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeFalsy();
  });

  test('AUX_CTMANA Geometry', () => {
    const sg = checkProductTypeSupports('AUX_CTMANA', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeFalsy();
  });
});

describe('checkAllProductsInInstrumentSupport', () => {
  test('SAR Geometry', () => {
    const sg = checkAllProductsInInstrumentSupport('SAR', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('TROPOMI Geometry', () => {
    const sg = checkAllProductsInInstrumentSupport('TROPOMI', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeFalsy();
  });

  test('VHR Europe Geometry', () => {
    const sg = checkAllProductsInInstrumentSupport('VHR_EUROPE', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('VHR Urban Atlas Geometry', () => {
    const sg = checkAllProductsInInstrumentSupport('VHR_URBAN_ATLAS', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('HR Europe Geometry', () => {
    const sg = checkAllProductsInInstrumentSupport('HR_EUROPE', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('MR Europe Geometry', () => {
    const sg = checkAllProductsInInstrumentSupport('MR_EUROPE', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('HR-MR Geometry', () => {
    const sg = checkAllProductsInInstrumentSupport('HR-MR', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });
});

describe('checkAllProductsInCollectionSupport', () => {
  test('S2 Geometry', () => {
    const sg = checkAllProductsInCollectionSupport('S2', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeFalsy();
  });

  test('S5P Geometry', () => {
    const sg = checkAllProductsInCollectionSupport('S5P', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeFalsy();
  });

  test('OPTICAL Geometry', () => {
    const sg = checkAllProductsInCollectionSupport('OPTICAL', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('Dem Geometry', () => {
    const sg = checkAllProductsInCollectionSupport('DEM', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('CCM_SAR Geometry', () => {
    const sg = checkAllProductsInCollectionSupport('CCM_SAR', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });
});

describe('roundGeometryValues', () => {
  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [44.6923828125, 35.40696093270201],
        [53.36059570312501, 35.40696093270201],
        [53.36059570312501, 45.87471224890479],
        [44.6923828125, 45.87471224890479],
        [44.6923828125, 35.40696093270201],
      ],
    ],
  };

  const geometry2 = {
    type: 'Polygon',
    coordinates: [
      [
        [44.692, 35.407],
        [53.361, 35.407],
        [53.361, 45.875],
        [44.692, 45.875],
        [44.692, 35.407],
      ],
    ],
  };

  test('roundGeometryValues', () => {
    const roundedGeometry = roundGeometryValues(geometry);
    expect(roundedGeometry).toEqual(geometry2);
  });
});

describe('createAdvancedSearchQuery', () => {
  const collectionS2 = { id: 'S2' };
  const fromTime = '2023-06-29T00:00:00.000Z';
  const toTime = '2023-06-29T23:59:59.999Z';
  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 1],
        [1, 1],
      ],
    ],
  };

  const originEsaString = `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq '${AttributeNames.origin}' and att/OData.CSC.StringAttribute/Value eq '${AttributeOriginValues.ESA.value}')`;
  const originCfString = `(Attributes/OData.CSC.StringAttribute/any(att:att/Name eq '${AttributeNames.origin}' and att/OData.CSC.StringAttribute/Value eq '${AttributeOriginValues.CLOUDFERRO.value}') and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq '${AttributeNames.processorVersion}' and att/OData.CSC.StringAttribute/Value eq '${AttributeProcessorVersionValues.V99_99.value}'))`;
  const originBothString = `(${originEsaString} or ${originCfString})`;

  test('origin filter no option selected', () => {
    const params = {
      collections: [collectionS2],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).not.toContain(originEsaString);
    expect(filter.value).not.toContain(originCfString);
  });

  test('origin filter ESA selected', () => {
    const params = {
      collections: [
        { ...collectionS2, additionalFilters: { [AttributeNames.origin]: [AttributeOriginValues.ESA] } },
      ],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(originEsaString);
    expect(filter.value).not.toContain(originCfString);
  });

  test('origin filter CLOUDFERRO selected', () => {
    const params = {
      collections: [
        {
          ...collectionS2,
          additionalFilters: { [AttributeNames.origin]: [AttributeOriginValues.CLOUDFERRO] },
        },
      ],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter.value).not.toBeNull();
    expect(filter.value).not.toContain(originEsaString);
    expect(filter.value).toContain(originCfString);
  });

  test('origin filter both options selected', () => {
    const params = {
      collections: [
        {
          ...collectionS2,
          additionalFilters: {
            [AttributeNames.origin]: [AttributeOriginValues.ESA, AttributeOriginValues.CLOUDFERRO],
          },
        },
      ],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(originEsaString);
    expect(filter.value).toContain(originCfString);
    expect(filter.value).toContain(originBothString);
  });

  test('S2 collection1 filter is selected', () => {
    const params = {
      collections: [
        {
          ...collectionS2,
          additionalFilters: {
            [AttributeNames.S2Collection]: [AttributeS2CollectionValues.COLLECTION1],
          },
        },
      ],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(
      `((ContentDate/Start ge 2015-07-04T00:00:00.000Z and ContentDate/Start lt 2021-12-31T23:59:59.999Z and ${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_00.value,
      )}) or (ContentDate/Start ge 2022-01-01T00:00:00.000Z and ContentDate/Start lt 2023-12-13T07:00:00.000Z and ${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_10.value,
      )})`,
    );
  });

  test('S2 collection1 filter is not selected', () => {
    const params = {
      collections: [
        {
          ...collectionS2,
          additionalFilters: {
            [AttributeNames.S2Collection]: undefined,
          },
        },
      ],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).not.toContain(AttributeProcessorVersionValues.V05_00.value);
    expect(filter.value).not.toContain(AttributeProcessorVersionValues.V05_10.value);
  });

  test('S2 collection1 filter and origin CLOUDFERRO are selected', () => {
    const params = {
      collections: [
        {
          ...collectionS2,
          additionalFilters: {
            [AttributeNames.S2Collection]: [AttributeS2CollectionValues.COLLECTION1],
            [AttributeNames.origin]: [AttributeOriginValues.CLOUDFERRO],
          },
        },
      ],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(
      `((ContentDate/Start ge ${
        AttributeProcessorVersionValues.V05_00.timeLimitations.fromTime
      } and ContentDate/Start lt ${
        AttributeProcessorVersionValues.V05_00.timeLimitations.toTime
      } and ${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_00.value,
      )}) or (ContentDate/Start ge ${
        AttributeProcessorVersionValues.V05_10.timeLimitations.fromTime
      } and ContentDate/Start lt ${
        AttributeProcessorVersionValues.V05_10.timeLimitations.toTime
      } and ${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_10.value,
      )})`,
    );
    expect(filter.value).toContain(originCfString);
  });
});

describe('createAdvancedSearchQuery - contains name', () => {
  const params = {
    fromTime: moment.utc('2023-06-29T00:00:00.000Z').toDate().toISOString(),
    toTime: moment.utc('2023-06-29T23:59:59.999Z').toDate().toISOString(),
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [1, 1],
          [1, 2],
          [2, 2],
          [2, 1],
          [1, 1],
        ],
      ],
    },
  };

  test('contains name and not contains name are set correctly for S1 GRD', () => {
    const collectionS1 = { id: 'S1', instruments: [{ id: 'SAR', productTypes: [{ id: 'GRD' }] }] };

    const oqb = oDataHelpers.createAdvancedSearchQuery({ ...params, collections: [collectionS1] });
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(`contains(Name,'GRD')`);
    expect(filter.value).toContain(`not contains(Name,'_COG')`);
  });

  test('contains name and not contains name are set correctly for S1 GRD-COG', () => {
    const collectionS1 = { id: 'S1', instruments: [{ id: 'SAR', productTypes: [{ id: 'GRD-COG' }] }] };

    const oqb = oDataHelpers.createAdvancedSearchQuery({ ...params, collections: [collectionS1] });
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(`contains(Name,'GRD')`);
    expect(filter.value).toContain(`contains(Name,'_COG')`);
    expect(filter.value).not.toContain(`and not contains(Name,'undefined')`);
  });

  test('only contains name is set for S1 SLC', () => {
    const collectionS1 = { id: 'S1', instruments: [{ id: 'SAR', productTypes: [{ id: 'SLC' }] }] };

    const oqb = oDataHelpers.createAdvancedSearchQuery({ ...params, collections: [collectionS1] });
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(`contains(Name,'SLC')`);
    expect(filter.value).not.toContain(`and not contains(Name,'undefined')`);
  });

  test('only contains name is set for S2', () => {
    const collectionS2 = { id: 'S2', instruments: [{ id: 'MSI', productTypes: [{ id: 'S2MSI1C' }] }] };
    const oqb = oDataHelpers.createAdvancedSearchQuery({ ...params, collections: [collectionS2] });
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(`contains(Name,'L1C')`);
    expect(filter.value).not.toContain(`and not contains(Name,'undefined')`);
  });
});

describe('createAdvancedSearchQuery', () => {
  const productName = 'S2';
  const collectionS1 = { id: 'S1', label: 'SENTINEL-1', instruments: [{ id: 'SAR' }] };
  const collectionS2 = { id: 'S2', label: 'SENTINEL-2', instruments: [{ id: 'MSI' }] };
  const collectionS3 = {
    id: 'S3',
    label: 'SENTINEL-3',
    instruments: [
      {
        id: 'S3AuxiliaryFiles',
        label: 'Auxiliary Data File',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'AUX_COMB__',
            name: 'AUX_COMB__',
            label: 'AUX_COMB',
            supportsGeometry: false,
            customFilterQueryByProductType: true,
          },
        ],
      },
    ],
  };
  const collectionDEM = { id: 'DEM', label: 'COP-DEM' };
  const fromTime = '2023-06-29T00:00:00.000Z';
  const toTime = '2023-06-29T23:59:59.999Z';
  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 1],
        [1, 1],
      ],
    ],
  };

  test('product name only', () => {
    const params = {
      name: productName,
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `contains(Name,'${productName}') and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime}`,
    );
  });

  test('product name and geometry only', () => {
    const params = {
      name: productName,
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `contains(Name,'${productName}') and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime} and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')`,
    );
  });

  test('one collection', () => {
    const params = {
      collections: [collectionS1],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq '${
        collectionS1.label
      }' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'instrumentShortName' and att/OData.CSC.StringAttribute/Value eq 'SAR') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  // 2 collections
  test('two collections', () => {
    const params = {
      collections: [collectionS1, collectionS2],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `(((Collection/Name eq '${
        collectionS1.label
      }' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'instrumentShortName' and att/OData.CSC.StringAttribute/Value eq 'SAR') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) or (Collection/Name eq '${
        collectionS2.label
      }' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'instrumentShortName' and att/OData.CSC.StringAttribute/Value eq 'MSI') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true)) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test.skip('collection with dates and collection without dates', () => {
    const params = {
      collections: [collectionS1, collectionDEM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `(((Collection/Name eq '${
        collectionS1.label
      }' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'instrumentShortName' and att/OData.CSC.StringAttribute/Value eq 'SAR') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime}) or (Collection/Name eq '${
        collectionDEM.label
      }' and (((contains(Name,'DGE_30') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (contains(Name,'DGE_90') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) or ((contains(Name,'DTE_30') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (contains(Name,'DTE_90') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')))) and Online eq true))`,
    );
  });

  test.skip('product name and collection without dates', () => {
    const params = {
      name: productName,
      collections: [collectionDEM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `contains(Name,'${productName}') and (Collection/Name eq '${
        collectionDEM.label
      }' and (((contains(Name,'DGE_30') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (contains(Name,'DGE_90') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) or ((contains(Name,'DTE_30') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (contains(Name,'DTE_90') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')))) and Online eq true)`,
    );
  });

  test('product name and collection with dates', () => {
    const params = {
      name: productName,
      collections: [collectionS1],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `contains(Name,'${productName}') and ((Collection/Name eq '${
        collectionS1.label
      }' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'instrumentShortName' and att/OData.CSC.StringAttribute/Value eq 'SAR') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('AUX_COMB__ product with customFilterQueryByProductType', () => {
    const params = {
      name: collectionS3.id,
      collections: [collectionS3],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `contains(Name,'S3') and ((Collection/Name eq '${collectionS3.label}' and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'AUX_COMB__') and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });
});

describe('createAdvancedSearchQuery for CCM data', () => {
  const fromTime = '2006-01-29T00:00:00.000Z';
  const toTime = '2024-12-29T23:59:59.999Z';
  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 1],
        [1, 1],
      ],
    ],
  };

  test('one collection', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'VHR_URBAN_ATLAS',
          label: ' VHR Urban Atlas',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR1-2_Urban_Atlas_2012',
              label: 'VHR Urban Atlas (2011–2013)',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };

    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR1-2_Urban_Atlas_2012') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('two collections', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'Very High Resolution (VHR)',
          selected: true,
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR_IMAGE_2015',
              label: 'VHR Europe (2014–2016)',
              customFilterQueryByDatasetFull: true,
            },
            {
              id: 'VHR_IMAGE_2021',
              label: 'VHR Europe (2020–2022)',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };
    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2015') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2021') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('three collections', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'Very High Resolution (VHR)',
          selected: true,
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR_IMAGE_2015',
              label: 'VHR Europe (2014–2016)',
              customFilterQueryByDatasetFull: true,
            },
            {
              id: 'VHR_IMAGE_2021',
              label: 'VHR Europe (2020–2022)',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
        {
          id: 'VHR_URBAN_ATLAS',
          label: 'Very High Resolution (VHR)',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR1-2_Urban_Atlas_2012',
              label: 'VHR Urban Atlas (2011–2013)',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };
    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and (((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2015') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2021') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR1-2_Urban_Atlas_2012') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection two product types with same product type id', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'Very High Resolution (VHR)',
          selected: true,
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR_IMAGE_2018',
              label: 'VHR Europe (2017–2019)',
              productTypeIds: ['VHR_IMAGE_2018', 'VHR_IMAGE_2018_ENHANCED'],
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };

    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018_ENHANCED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection two product types with same product type id plus another collection with two product types', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'Very High Resolution (VHR)',
          selected: true,
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR_IMAGE_2018',
              label: 'VHR Europe (2017–2019)',
              productTypeIds: ['VHR_IMAGE_2018', 'VHR_IMAGE_2018_ENHANCED'],
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
        {
          id: 'VHR_URBAN_ATLAS',
          label: 'Very High Resolution (VHR)',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'DAP_MG2b_01',
              label: 'VHR Urban Atlas (2006, 2009)',
              productTypeIds: ['DAP_MG2b_01', 'DAP_MG2b_02'],
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };

    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and (((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018_ENHANCED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) or ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2b_01') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2b_02') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection DWH_MG2b_CORE_03 CCM', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'VHR Europe',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'DWH_MG2b_CORE_03',
              label: 'VHR Europe (2011–2013)',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };

    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DWH_MG2b_CORE_03') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection VHR Urban Atlas (2006, 2009) - two product types', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      instruments: [
        {
          id: 'VHR_URBAN_ATLAS',
          label: ' VHR Urban Atlas',
          productTypes: [
            {
              id: 'DAP_MG2b_01',
              label: 'VHR Urban Atlas (2006, 2009)',
              productTypeIds: ['DAP_MG2b_01', 'DAP_MG2b_02'],
            },
          ],
        },
      ],
    };

    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2b_01') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2b_02') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection VHR DEM', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'VHR Europe',
          productTypes: [
            {
              id: 'DEM_VHR_2018',
              label: 'VHR DEM (2018)',
            },
          ],
        },
      ],
    };

    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DEM_VHR_2018')`,
    );
  });

  test('HR Europe collections', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'HR_EUROPE',
          label: 'HR Europe',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'DAP_MG2-3_01',
              label: 'HR Europe (2006, 2009)',
              customFilterQueryByDatasetFull: true,
              productTypeIds: ['DAP_MG2-3_01', 'DWH_MG2_CORE_02'],
            },
            {
              id: 'EUR_HR2_MULTITEMP',
              label: 'HR Europe monthly (Apr–Oct 2015))',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };
    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2-3_01') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DWH_MG2_CORE_02') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'EUR_HR2_MULTITEMP') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('MR Europe collections', () => {
    const collectionCCM = {
      id: 'OPTICAL',
      label: 'CCM Optical',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'MR_EUROPE',
          label: 'MR Europe',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'MR_IMAGE_2015',
              label: 'MR Europe monthly (Mar–Oct 2014)',
              customFilterQueryByDatasetFull: true,
            },
            {
              id: 'DWH_MG2-3_CORE_08',
              label: 'MR Europe monthly (2011–2012)',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: true,
    };
    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'MR_IMAGE_2015') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DWH_MG2-3_CORE_08') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('CCM_SAR collections', () => {
    const collectionCCM = {
      id: 'CCM_SAR',
      label: 'CCM SAR',
      collectionName: 'CCM',
      instruments: [
        {
          id: 'HR-MR',
          label: 'HR-MR Sea Ice Monitoring',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'DWH_MG1_CORE_11',
              label: 'HR-MR Sea Ice Monitoring (2011–2014)',
              customFilterQueryByDatasetFull: true,
            },
            {
              id: 'SAR_SEA_ICE',
              label: 'HR-MR Sea Ice Monitoring (2015–2024)',
              customFilterQueryByDatasetFull: true,
            },
          ],
        },
      ],
      supportsCloudCover: false,
    };
    const params = {
      collections: [collectionCCM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DWH_MG1_CORE_11') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'SAR_SEA_ICE') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });
});

describe('createAdvancedSearchQuery for DEM data', () => {
  const fromTime = '2006-01-29T00:00:00.000Z';
  const toTime = '2024-12-29T23:59:59.999Z';
  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 1],
        [1, 1],
      ],
    ],
  };

  test('one collection selected', () => {
    const collectionDEM = {
      id: 'DEM',
      instruments: [
        {
          id: 'open',
          productTypes: [
            {
              id: 'COP-DEM_EEA-10-DGED',
              productTypes: [],
            },
          ],
        },
      ],
    };

    const params = {
      collections: [collectionDEM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-DGED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('more than one collection selected', () => {
    const collectionDEM = {
      id: 'DEM',
      instruments: [
        {
          id: 'restricted',
          productTypes: [
            {
              id: 'COP-DEM_EEA-10-DGED',
              productTypes: [],
            },
            {
              id: 'COP-DEM_EEA-10-INSP',
              productTypes: [],
            },
          ],
        },
      ],
    };

    const params = {
      collections: [collectionDEM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq 'CCM' and ((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-DGED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-INSP') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('no collections (on instruments level) selected', () => {
    const collectionDEM = {
      id: 'DEM',
      instruments: [],
    };

    const params = {
      collections: [collectionDEM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-DGED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'`,
    );
    expect(filter.value).toContain(
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-INSP') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'`,
    );
    expect(filter.value).toContain(
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-30-DGED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'`,
    );
    expect(filter.value).toContain(
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-30-DTED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'`,
    );
    expect(filter.value).toContain(
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-90-DGED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'`,
    );
    expect(filter.value).toContain(
      `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-90-DTED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'`,
    );
    expect(filter.value).toContain(`ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`);
  });
});

describe('createAdvancedSearchQuery for mosaics', () => {
  const collectionS1Mosaics = {
    id: 'GLOBAL-MOSAICS',
    label: 'GLOBAL-MOSAICS',
    instruments: [
      {
        id: 'S1Mosaics',
        label: 'Sentinel-1',
        productTypes: [
          {
            id: '_IW_mosaic_',
            name: '_IW_mosaic_',
            label: 'IW Monthly Mosaics',
          },
          {
            id: '_DH_mosaic_',
            name: '_DH_mosaic_',
            label: 'DH Monthly Mosaics',
          },
        ],
      },
    ],
  };
  const collectionS2Mosaics = {
    id: 'GLOBAL-MOSAICS',
    label: 'GLOBAL-MOSAICS',
    instruments: [
      {
        id: 'S2Mosaics',
        label: 'Sentinel-2',
        productTypes: [
          {
            id: 'S2MSI_L3__MCQ',
            name: 'Quarterly Mosaics',
          },
        ],
      },
    ],
  };
  const fromTime = '2023-01-01T00:00:00.000Z';
  const toTime = '2023-10-01T23:59:59.999Z';
  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 1],
        [1, 1],
      ],
    ],
  };

  test('S1 mosaics', () => {
    const params = {
      collections: [collectionS1Mosaics],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq '${
        collectionS1Mosaics.label
      }' and ((contains(Name,'_IW_mosaic_') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (contains(Name,'_DH_mosaic_') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('S2 mosaics', () => {
    const params = {
      collections: [collectionS2Mosaics],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toEqual(
      `((Collection/Name eq '${
        collectionS2Mosaics.label
      }' and (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'S2MSI_L3__MCQ') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });
});

describe('createAdditionalFilters', () => {
  const fromTime = '2006-01-29T00:00:00.000Z';
  const toTime = '2024-12-29T23:59:59.999Z';
  const geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 1],
        [1, 1],
      ],
    ],
  };

  test('DEM dataset filter', () => {
    const collectionDEM = {
      id: 'DEM',
      instruments: [
        {
          id: 'open',
          productTypes: [
            {
              id: 'COP-DEM_EEA-10-DGED',
              productTypes: [],
            },
          ],
        },
      ],
      additionalFilters: {
        deliveryId: [
          {
            id: 'DEM',
            value: '2023_1',
            label: '2023_1',
          },
        ],
      },
    };

    const params = {
      collections: [collectionDEM],
      fromTime: moment.utc(fromTime).toDate().toISOString(),
      toTime: moment.utc(toTime).toDate().toISOString(),
      geometry: geometry,
    };

    const oqb = oDataHelpers.createAdvancedSearchQuery(params);
    expect(oqb?.options).not.toBeNull();
    const filter = oqb._findOption('filter');
    expect(filter).not.toBeNull();
    expect(filter.value).toContain(
      `(Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'dataset' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-30-DGED%2F2023_1') or Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'dataset' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-30-DTED%2F2023_1') or Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'dataset' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-90-DGED%2F2023_1') or Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'dataset' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-90-DTED%2F2023_1') or Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'dataset' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-DGED%2F2023_1') or Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'dataset' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-INSP%2F2023_1'))`,
    );
  });
});
