import moment from 'moment';
import { AttributeNames, ODataAttributes } from '../../../../../api/OData/assets/attributes';
import { AttributeTooltips } from '../../../../../api/OData/assets/tooltips';
import { ExpressionTreeOperator } from '../../../../../api/OData/ExpressionTree';
import { ODataFilterBuilder } from '../../../../../api/OData/ODataFilterBuilder';
import oDataHelpers from '../../../../../api/OData/ODataHelpers';
import { ODataFilterOperator } from '../../../../../api/OData/ODataTypes';
import { isFunction } from '../../../../../utils';

export const getAdditionalFilterData = (collectionId, attributeId, props) => {
  const title = oDataHelpers.formatAttributesNames(attributeId);
  let tooltip;
  if (AttributeTooltips[collectionId]?.[attributeId]) {
    if (isFunction(AttributeTooltips[collectionId]?.[attributeId])) {
      tooltip = AttributeTooltips[collectionId]?.[attributeId]();
    } else {
      tooltip = AttributeTooltips[collectionId]?.[attributeId];
    }
  }
  return {
    ...props,
    id: attributeId,
    title: title,
    tooltip: tooltip,
  };
};

export const getAllFiltersForCollection = (collection) =>
  collection.additionalFilters?.map((additionalFilter) =>
    getAdditionalFilterData(collection.id, additionalFilter.id, additionalFilter),
  );

export const createS1GRDResolutionFilter = (key, value) => {
  const s1GRDResolutionFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  s1GRDResolutionFilter.contains(AttributeNames.productName, `GRD${value}`, 'string');
  return s1GRDResolutionFilter;
};

export const createAcrossTrackIncidenceAngleFilter = (key, value) => {
  const values = [value, -value];
  const filter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  filter.attribute(ODataAttributes.acrossTrackIncidenceAngle, ODataFilterOperator.le, Math.max(...values));
  filter.attribute(ODataAttributes.acrossTrackIncidenceAngle, ODataFilterOperator.ge, Math.min(...values));
  return filter;
};

export const createBiogeophysicalCloudCoverFilter = (key, value) => {
  const filter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  filter.attribute(ODataAttributes.cloudCover, ODataFilterOperator.le, value);
  return filter;
};

export const createBiogeophysicalProjectionGridFilter = (key, value) => {
  const [projection, grid] = value.split('|');
  const filter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  filter.attribute(ODataAttributes.projectionName, ODataFilterOperator.eq, projection);
  filter.attribute(ODataAttributes.gridLabel, ODataFilterOperator.eq, grid);
  return filter;
};

export const getS5MaxAbsoluteOrbit = () => {
  const days = moment.utc().endOf('day').diff(moment.utc('2017-10-13'), 'days');
  const orbitalCycle = 16;
  const orbitsPerCycle = 227;
  return Math.ceil(days * (orbitsPerCycle / orbitalCycle));
};
