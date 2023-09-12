import {
  AttributeOriginValues,
  AttributeProcessorVersionValues,
  AttributeS2CollectionValues,
  ODAtaAttributes,
} from '../../../../../api/OData/assets/attributes';
import { AttributeTooltips } from '../../../../../api/OData/assets/tooltips';
import { ExpressionTreeOperator } from '../../../../../api/OData/ExpressionTree';
import { ODataFilterBuilder } from '../../../../../api/OData/ODataFilterBuilder';
import oDataHelpers from '../../../../../api/OData/ODataHelpers';
import { ODataFilterOperator } from '../../../../../api/OData/ODataTypes';

export const ADDITIONAL_FILTERS_ENABLED = true;

export const getAdditionalFilterData = (collectionId, attributeId, props) => {
  const title = oDataHelpers.formatAttributesNames(attributeId);
  return {
    ...props,
    id: attributeId,
    title: title,
    tooltip: AttributeTooltips[collectionId][attributeId] ?? title,
  };
};

export const getAllFiltersForCollection = (collection) =>
  collection.additionalFilters.map((additionalFilter) =>
    getAdditionalFilterData(collection.id, additionalFilter.id, additionalFilter),
  );

// creates a filter tree for "origin" attribute where option AttributeOriginValues.CLOUDFERRO
// needs an additional attribute ODAtaAttributes.processorVersion to be added to the filter query
export const createOriginFilter = (key, value) => {
  const originOptionFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  originOptionFilter.attribute(ODAtaAttributes[key], ODataFilterOperator.eq, value);
  if (value === AttributeOriginValues.CLOUDFERRO.value) {
    originOptionFilter.attribute(
      ODAtaAttributes.processorVersion,
      ODataFilterOperator.eq,
      AttributeProcessorVersionValues.V99_99.value,
    );
  }
  return originOptionFilter;
};

export const createS2Collection1Filter = (key, value) => {
  const S2Collection1ProcessorVersions = [
    AttributeProcessorVersionValues.V05_00,
    AttributeProcessorVersionValues.V05_09,
  ];

  let s2Collection1Filter = null;

  if (value === AttributeS2CollectionValues.COLLECTION1.value) {
    s2Collection1Filter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
    S2Collection1ProcessorVersions.forEach((processorVersion) => {
      s2Collection1Filter.attribute(
        ODAtaAttributes.processorVersion,
        ODataFilterOperator.eq,
        processorVersion.value,
      );
    });
  }

  return s2Collection1Filter;
};
