import moment from 'moment';

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
  ODAtaAttributes,
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

describe('checkAllInstrumentsInCollectionSupport', () => {
  test('S2 InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('S2', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
  });

  test('S5P InstrumentName', () => {
    const sg = checkAllInstrumentsInCollectionSupport('S5P', SUPPORTED_PROPERTIES.InstrumentName);
    expect(sg).toBeFalsy();
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
        ODAtaAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_00.value,
      )} or ${FilterElement.Attribute(
        ODAtaAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_09.value,
      )} or ${FilterElement.Attribute(
        ODAtaAttributes.processorVersion,
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
        ODAtaAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_00.value,
      )} or ${FilterElement.Attribute(
        ODAtaAttributes.processorVersion,
        ODataFilterOperator.eq,
        AttributeProcessorVersionValues.V05_09.value,
      )} or ${FilterElement.Attribute(
        ODAtaAttributes.processorVersion,
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
