import { FilterElement, Functions } from './FilterElement';
import { ODataDoubleAttribute, ODataStringAttribute } from './ODataAttribute';
import { ODataFilterBuilder } from './ODataFilterBuilder';
import { ODataFilterOperator } from './ODataTypes';

describe('ODataFilterBuilder', () => {
  test('contains', () => {
    const ofb = new ODataFilterBuilder();
    ofb.contains('Name', 'SENTINEL-1');

    expect(ofb.getQueryString()).toBe("contains(Name,'SENTINEL-1')");
    ofb.contains('Name', 'SENTINEL-2');
    expect(ofb.getQueryString('and')).toBe("contains(Name,'SENTINEL-1') and contains(Name,'SENTINEL-2')");
  });

  test('startsWith', () => {
    const ofb = new ODataFilterBuilder();
    ofb.startsWith('Name', 'SENTINEL-1');

    expect(ofb.getQueryString()).toBe("startswith(Name,'SENTINEL-1')");
    ofb.startsWith('Name', 'SENTINEL-2');
    expect(ofb.getQueryString()).toBe("startswith(Name,'SENTINEL-1') and startswith(Name,'SENTINEL-2')");
  });

  test.each([
    ['StringField', ODataFilterOperator.eq, 'SENTINEL-1', 'string', "StringField eq 'SENTINEL-1'"],
    ['NumberField', ODataFilterOperator.ge, '1', undefined, 'NumberField ge 1'],
    ['DateField', ODataFilterOperator.lt, '2022-12-16', undefined, 'DateField lt 2022-12-16'],
    ['BooleanField', ODataFilterOperator.ne, 'True', undefined, 'BooleanField ne True'],
  ])('expression %p %p %p', (key, op, value, type, expected) => {
    const ofb = new ODataFilterBuilder();
    ofb.expression(key, op, value, type);
    expect(ofb.getQueryString()).toBe(expected);
  });

  test.each([
    ['POLYGON [1,2,3,4]', "OData.CSC.Intersects(area=geography'SRID=4326;POLYGON [1,2,3,4]')", false],
    [
      'SRID=4326;POLYGON [1,2,3,4]',
      "OData.CSC.Intersects(area=geography'SRID=4326;POLYGON [1,2,3,4]')",
      false,
    ],
    ['SRID=3857;POLYGON [1,2,3,4]', null, 'Coordinates must be given in EPSG 4326'],
  ])('intersects %p', (wkt, expected, error) => {
    const ofb = new ODataFilterBuilder();

    if (error) {
      expect(() => ofb.intersects(wkt)).toThrowError(error);
    } else {
      ofb.intersects(wkt);
      expect(expect(ofb.getQueryString()).toBe(expected));
    }
  });

  test('not', () => {
    let ofb = new ODataFilterBuilder();
    ofb.not(FilterElement.Function(Functions.contains, 'Name', 'SENTINEL-1', 'string'));

    expect(ofb.getQueryString()).toBe("not(contains(Name,'SENTINEL-1'))");
  });

  test('and with another filter ', () => {
    let ofb = new ODataFilterBuilder();
    ofb.expression('DateField', ODataFilterOperator.gt, '2022-12-01');
    const collectionsFilter = new ODataFilterBuilder('or')
      .contains('Name', 'SENTINEL-1')
      .contains('Name', 'SENTINEL-2');

    ofb.and(collectionsFilter.getTree());
    expect(ofb.getQueryString()).toBe(
      "DateField gt 2022-12-01 and (contains(Name,'SENTINEL-1') or contains(Name,'SENTINEL-2'))",
    );
  });

  test('or', () => {
    const ofb = new ODataFilterBuilder('and');
    ofb.expression('DateField', ODataFilterOperator.gt, '2022-12-01');
    const collectionsFilter = new ODataFilterBuilder('or')
      .contains('Name', 'SENTINEL-1')
      .contains('Name', 'SENTINEL-2');

    ofb.or(collectionsFilter.getTree());
    expect(ofb.getQueryString()).toBe(
      "DateField gt 2022-12-01 or (contains(Name,'SENTINEL-1') or contains(Name,'SENTINEL-2'))",
    );
  });

  test('multiple (a or b) and (c or d)', () => {
    const ofb = new ODataFilterBuilder();

    const collectionFilter = new ODataFilterBuilder('or')
      .contains('Name', 'SENTINEL-1')
      .contains('Name', 'SENTINEL-2');

    const dateFilter = new ODataFilterBuilder('or')
      .expression('DateField', ODataFilterOperator.gt, '2022-12-01')
      .expression('DateField', ODataFilterOperator.lt, '2022-12-15');

    ofb.and(collectionFilter.getTree());
    ofb.and(dateFilter.getTree());

    expect(ofb.getQueryString()).toBe(
      "(contains(Name,'SENTINEL-1') or contains(Name,'SENTINEL-2')) and (DateField gt 2022-12-01 or DateField lt 2022-12-15)",
    );
  });

  test('multiple (a and b) or (c and d)', () => {
    const ofb = new ODataFilterBuilder('or');

    const collectionFilter = new ODataFilterBuilder()
      .contains('Name', 'SENTINEL-1')
      .contains('Name', 'SENTINEL-2');

    const dateFilter = new ODataFilterBuilder()
      .expression('DateField', ODataFilterOperator.gt, '2022-12-01')
      .expression('DateField', ODataFilterOperator.lt, '2022-12-15');

    ofb.or(collectionFilter.getTree());
    ofb.or(dateFilter.getTree());

    expect(ofb.getQueryString()).toBe(
      "(contains(Name,'SENTINEL-1') and contains(Name,'SENTINEL-2')) or (DateField gt 2022-12-01 and DateField lt 2022-12-15)",
    );
  });

  test('attribute', () => {
    const ofb = new ODataFilterBuilder();
    ofb.attribute(new ODataDoubleAttribute('cc'), ODataFilterOperator.le, 30);
    expect(ofb.getQueryString()).toBe(
      "Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cc' and att/OData.CSC.DoubleAttribute/Value le 30)",
    );
  });
});

describe('some examples from EOData Catalogue API Manual', () => {
  //
  test('cloudCover<40% between two dates', () => {
    const ofb = new ODataFilterBuilder();
    ofb.attribute(new ODataDoubleAttribute('cloudCover'), ODataFilterOperator.le, 40);

    ofb.expression('ContentDate/Start', ODataFilterOperator.gt, '2022-01-01T00:00:00.000Z');
    ofb.expression('ContentDate/Start', ODataFilterOperator.lt, '2022-01-03T00:00:00.000Z');

    expect(ofb.getQueryString()).toBe(
      "Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value le 40) and ContentDate/Start gt 2022-01-01T00:00:00.000Z and ContentDate/Start lt 2022-01-03T00:00:00.000Z",
    );
  });

  test('cloudCover< 10% and productType=S2MSI2A and ASCENDING orbitDirection between two dates', () => {
    const ofb = new ODataFilterBuilder();
    ofb.attribute(new ODataDoubleAttribute('cloudCover'), ODataFilterOperator.lt, 10);
    ofb.attribute(new ODataStringAttribute('productType'), ODataFilterOperator.eq, 'S2MSI2A');
    ofb.attribute(new ODataStringAttribute('orbitDirection'), ODataFilterOperator.eq, 'ASCENDING');
    ofb.expression('ContentDate/Start', ODataFilterOperator.gt, '2022-05-03T00:00:00.000Z');
    ofb.expression('ContentDate/Start', ODataFilterOperator.lt, '2022-05-03T04:00:00.000Z');

    expect(ofb.getQueryString()).toBe(
      "Attributes/OData.CSC.DoubleAttribute/any(att:att/Name eq 'cloudCover' and att/OData.CSC.DoubleAttribute/Value lt 10) and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'S2MSI2A') and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'orbitDirection' and att/OData.CSC.StringAttribute/Value eq 'ASCENDING') and ContentDate/Start gt 2022-05-03T00:00:00.000Z and ContentDate/Start lt 2022-05-03T04:00:00.000Z",
    );
  });
});

describe('use expression not yet supported by ODataFilterBuilder ', () => {
  //in future we may stumble upon new expression types that are not yet supported by ODataFilterBuilder.
  //idealy we would extend ODataFilterBuilder, but if for some reason we don't want to do this, new
  //expression can still be added by using addExpression
  test('startsWith', () => {
    const ofb = new ODataFilterBuilder();
    ofb.addExpression(`startswith(Name,'S1')`);
    expect(ofb.getQueryString()).toBe("startswith(Name,'S1')");
  });
});
