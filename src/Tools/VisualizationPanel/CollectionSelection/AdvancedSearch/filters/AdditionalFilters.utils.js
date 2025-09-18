import moment from 'moment';
import {
  AttributeNames,
  AttributeOriginValues,
  AttributeProcessorVersionValues,
  ODataAttributes,
} from '../../../../../api/OData/assets/attributes';
import { AttributeTooltips } from '../../../../../api/OData/assets/tooltips';
import { ExpressionTreeOperator } from '../../../../../api/OData/ExpressionTree';
import { ODataFilterBuilder } from '../../../../../api/OData/ODataFilterBuilder';
import oDataHelpers from '../../../../../api/OData/ODataHelpers';
import { ODataFilterOperator } from '../../../../../api/OData/ODataTypes';
import { isFunction } from '../../../../../utils';

export const ADDITIONAL_FILTERS_ENABLED = true;

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

// creates a filter tree for "origin" attribute where option AttributeOriginValues.CLOUDFERRO
// needs an additional attribute ODataAttributes.processorVersion to be added to the filter query
export const createOriginFilter = (key, value) => {
  const originOptionFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  originOptionFilter.attribute(ODataAttributes[key], ODataFilterOperator.eq, value);
  if (value === AttributeOriginValues.CLOUDFERRO.value) {
    originOptionFilter.attribute(
      ODataAttributes.processorVersion,
      ODataFilterOperator.eq,
      AttributeProcessorVersionValues.V99_99.value,
    );
  }
  return originOptionFilter;
};

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

export const getS5MaxAbsoluteOrbit = () => {
  const days = moment.utc().endOf('day').diff(moment.utc('2017-10-13'), 'days');
  const orbitalCycle = 16;
  const orbitsPerCycle = 227;
  return Math.ceil(days * (orbitsPerCycle / orbitalCycle));
};
