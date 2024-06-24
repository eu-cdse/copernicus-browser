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

  test('CCM', () => {
    const collection = findCollectionConfigById('CCM');
    expect(collection.id).toEqual('CCM');
    expect(collection.instruments).toBeDefined();
    expect(collection.instruments.length).toBeGreaterThan(0);
  });

  test('DEM', () => {
    const collection = findCollectionConfigById('DEM');
    expect(collection.id).toEqual('DEM');
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

describe('checkCollectionSupports', () => {
  test('CCM CollectionName', () => {
    const { supportsCollectionName } = findCollectionConfigById('CCM');
    expect(supportsCollectionName).toBeFalsy();
  });

  test('DEM CollectionName', () => {
    const { supportsCollectionName } = findCollectionConfigById('DEM');
    expect(supportsCollectionName).toBeFalsy();
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

describe('check queryByDatasetFull supports', () => {
  test.each([
    ['COP-DEM_EEA-10-DGED'],
    ['COP-DEM_EEA-10-INSP'],
    ['COP-DEM_GLO-30-DGED'],
    ['COP-DEM_GLO-30-DTED'],
    ['COP-DEM_GLO-90-DGED'],
    ['COP-DEM_GLO-90-DTED'],
  ])('Dem %p', (id) => {
    const { queryByDatasetFull } = findProductTypeConfigById(id);
    expect(queryByDatasetFull).toBeTruthy();
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

  test('CCM InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('CCM', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('DEM InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('DEM', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });
});

describe('checkProductsSupport ', () => {
  test.each(['DAP_MG2b_01', 'VHR_IMAGE_2018', 'VHR_IMAGE_2021'])(`queryByDatasetFull`, (id) => {
    const { queryByDatasetFull } = findProductTypeConfigById(id);
    expect(queryByDatasetFull).toBeTruthy();
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

  test('CCM Geometry', () => {
    const sg = checkAllProductsInCollectionSupport('CCM', SUPPORTED_PROPERTIES.Geometry);
    expect(sg).toBeTruthy();
  });

  test('Dem Geometry', () => {
    const sg = checkAllProductsInCollectionSupport('DEM', SUPPORTED_PROPERTIES.Geometry);
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
        [44.69, 35.41],
        [53.36, 35.41],
        [53.36, 45.87],
        [44.69, 45.87],
        [44.69, 35.41],
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
      `(${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_00.value,
      )} or ${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_09.value,
      )} or ${FilterElement.Attribute(
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
    expect(filter.value).not.toContain(AttributeProcessorVersionValues.V05_09.value);
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
      `(${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_00.value,
      )} or ${FilterElement.Attribute(
        ODataAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_09.value,
      )} or ${FilterElement.Attribute(
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
      id: 'CCM',
      label: 'CCM Optical',
      supportsCollectionName: false,
      instruments: [
        {
          id: 'VHR_URBAN_ATLAS',
          label: ' VHR Urban Atlas',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'DAP_MG2b_01',
              label: 'VHR Urban Atlas (2006, 2009)',
              queryByDatasetFull: true,
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
      `(((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2b_01') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('two collections', () => {
    const collectionCCM = {
      id: 'CCM',
      label: 'CCM Optical',
      supportsCollectionName: false,
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
              queryByDatasetFull: true,
            },
            {
              id: 'VHR_IMAGE_2021',
              label: 'VHR Europe (2020–2022)',
              queryByDatasetFull: true,
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
      `((((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2015') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2021') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('three collections', () => {
    const collectionCCM = {
      id: 'CCM',
      label: 'CCM Optical',
      supportsCollectionName: false,
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
              queryByDatasetFull: true,
            },
            {
              id: 'VHR_IMAGE_2021',
              label: 'VHR Europe (2020–2022)',
              queryByDatasetFull: true,
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
              queryByDatasetFull: true,
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
      `(((((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2015') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2021') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2b_01') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection two product types with same product type id', () => {
    const collectionCCM = {
      id: 'CCM',
      label: 'CCM Optical',
      supportsCollectionName: false,
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'Very High Resolution (VHR)',
          selected: true,
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR_IMAGE_2018',
              label: 'VHR Europe (2017–2019) (1)',
              // productTypeIds: ['VHR_IMAGE_2018', 'VHR_IMAGE_2018_ENHANCED'], // uncomment this
              queryByDatasetFull: true,
            },
            {
              // remove this
              id: 'VHR_IMAGE_2018_ENHANCED',
              label: 'VHR Europe (2017–2019) (2)',
              queryByDatasetFull: true,
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
      `((((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018_ENHANCED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection two product types with same product type id plus another collection', () => {
    const collectionCCM = {
      id: 'CCM',
      label: 'CCM Optical',
      supportsCollectionName: false,
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'Very High Resolution (VHR)',
          selected: true,
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'VHR_IMAGE_2018',
              label: 'VHR Europe (2017–2019) (1)',
              // productTypeIds: ['VHR_IMAGE_2018', 'VHR_IMAGE_2018_ENHANCED'], // uncomment this
              queryByDatasetFull: true,
            },
            {
              // remove this one
              id: 'VHR_IMAGE_2018_ENHANCED',
              label: 'VHR Europe (2017–2019) (2)',
              queryByDatasetFull: true,
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
              queryByDatasetFull: true,
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
      `(((((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'VHR_IMAGE_2018_ENHANCED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) or (Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DAP_MG2b_01') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}'))) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
    );
  });

  test('one collection DWH_MG2b_CORE_03 CCM', () => {
    const collectionCCM = {
      id: 'CCM',
      label: 'CCM Optical',
      supportsCollectionName: false,
      instruments: [
        {
          id: 'VHR_EUROPE',
          label: 'VHR Europe',
          supportsInstrumentName: false,
          productTypes: [
            {
              id: 'DWH_MG2b_CORE_03',
              label: 'VHR Europe (2011–2013)',
              queryByDatasetFull: true,
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
      `(((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DWH_MG2b_CORE_03') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
        geometry,
      )}')) and Online eq true) and ContentDate/Start ge ${fromTime} and ContentDate/Start lt ${toTime})`,
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
      `(((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-DGED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
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
      `((((Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_EEA-10-DGED') and OData.CSC.Intersects(area=geography'SRID=4326;${wellknown.stringify(
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
