import { ODataEntity } from './ODataTypes';
import { ODataFilterBuilder } from './ODataFilterBuilder';
import { ODataQueryBuilder } from './ODataQueryBuilder';

describe('ODataQueryBuilder', () => {
  test('getQueryString', () => {
    let oqb = new ODataQueryBuilder(ODataEntity.Products);
    expect(oqb.getQueryString()).toBe(`${ODataEntity.Products}`);
    oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).toBe(`${ODataEntity.Products}`);
  });

  test('top', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`top`);
    oqb.top(100);
    expect(oqb.getQueryString()).toContain(`&$top=100`);
    oqb.top();
    expect(oqb.getQueryString()).not.toContain(`&$top`);
  });

  test('orderBy', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`orderby`);
    oqb.orderBy('Name', 'asc');
    expect(oqb.getQueryString()).toContain(`&$orderby=Name asc`);
    oqb.orderBy('Name', 'desc');
    expect(oqb.getQueryString()).toContain(`&$orderby=Name desc`);
    oqb.orderBy();
    expect(oqb.getQueryString()).not.toContain(`&$orderby`);
  });

  test('skip', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`skip`);
    oqb.skip(20);
    expect(oqb.getQueryString()).toContain(`&$skip=20`);
    oqb.skip();
    expect(oqb.getQueryString()).not.toContain(`&$skip`);
    oqb.skip(0);
    expect(oqb.getQueryString()).toContain(`&$skip=0`);
    oqb = new ODataQueryBuilder();
    oqb.skip(1);
    oqb.skip(2);
    expect(oqb.getQueryString()).not.toContain(`&$skip=1`);
    expect(oqb.getQueryString()).toContain(`&$skip=2`);
  });

  test('count', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`count`);
    oqb.count();
    expect(oqb.getQueryString()).toContain(`&$count=True`);
  });

  test('attributes', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`expand`);
    expect(oqb.getQueryString()).not.toContain(`Attributes`);
    oqb.attributes();
    expect(oqb.getQueryString()).toContain(`&$expand=Attributes`);
  });

  test('assets', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`expand`);
    expect(oqb.getQueryString()).not.toContain(`Assets`);
    oqb.assets();
    expect(oqb.getQueryString()).toContain(`&$expand=Assets`);
  });

  test('filter', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`filter`);
    oqb.filter(new ODataFilterBuilder().contains('Field1', 'Value1'));
    expect(oqb.getQueryString()).toContain(`&$filter=contains(Field1,'Value1')`);
    oqb.filter();
    expect(oqb.getQueryString()).not.toContain(`filter`);
    oqb.filter(new ODataFilterBuilder().contains('Field2', 'Value2').getQueryString());
    expect(oqb.getQueryString()).toContain(`&$filter=contains(Field2,'Value2')`);
  });

  test('id', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`c29e3a-YOUR-INSTANCEID-HERE`);
    oqb.id('c29e3a-YOUR-INSTANCEID-HERE');
    expect(oqb.getQueryString()).toContain(`(c29e3a-YOUR-INSTANCEID-HERE)`);
  });

  test('value', () => {
    let oqb = new ODataQueryBuilder();
    expect(oqb.getQueryString()).not.toContain(`c29e3a-YOUR-INSTANCEID-HERE`);
    expect(oqb.getQueryString()).not.toContain(`value`);
    oqb.value('c29e3a-YOUR-INSTANCEID-HERE');
    expect(oqb.getQueryString()).toContain(`(c29e3a-YOUR-INSTANCEID-HERE)/$value`);
  });

  test('full query', () => {
    let oqb = new ODataQueryBuilder(ODataEntity.Products);
    oqb.value('ee-cb9-436dc-9-7c29e3a016c0f11a0bffa');
    expect(oqb.getQueryString()).toBe(`Products(ee-cb9-436dc-9-7c29e3a016c0f11a0bffa)/$value`);

    oqb = new ODataQueryBuilder(ODataEntity.Products);
    oqb.filter('Filter');
    oqb.orderBy('Name', 'asc');
    oqb.attributes();
    oqb.assets();
    oqb.count();
    oqb.top(50);

    expect(oqb.getQueryString()).toBe(
      `Products?&$filter=Filter&$orderby=Name asc&$expand=Attributes&$expand=Assets&$count=True&$top=50`,
    );
  });
});
