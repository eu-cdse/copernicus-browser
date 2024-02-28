import cloneDeep from 'lodash.clonedeep';
import { isFunction } from '../../../../utils';

export const CollectionFormInitialState = {
  selectedCollections: {},
  maxCc: {},
  selectedFilters: {},
};

export const checkFormElementAccess = (formElement, props) => {
  const { hasAccess } = formElement || {};

  if (hasAccess === undefined) {
    return true;
  }

  if (isFunction(hasAccess)) {
    return hasAccess(props);
  }

  return !!hasAccess;
};

const checkCollectionFormAccess = (formElements, props) => {
  return formElements
    .filter((formElement) => checkFormElementAccess(formElement, props))
    .map((formElement) => {
      let result = { ...formElement };

      Object.keys(formElement)
        .filter(
          (key) =>
            Array.isArray(formElement[key]) &&
            formElement[key].every((element) => typeof element === 'object'),
        )
        .forEach((key) => {
          result[key] = checkCollectionFormAccess(formElement[key], props);
        });

      return result;
    });
};

export const getCollectionFormConfig = (collections, props) => {
  if (!collections || !Array.isArray(collections)) {
    return null;
  }

  return checkCollectionFormAccess(collections, props);
};

export const getCollectionFormInitialState = (collectionFormConfig, formState, options) => {
  if (!formState?.selectedCollections || !Object.keys(formState?.selectedCollections).length) {
    return CollectionFormInitialState;
  }

  let initialState = cloneDeep(formState);

  const { selectedCollections = {}, selectedFilters = {} } = initialState;

  Object.keys(selectedCollections).forEach((selectedCollection) => {
    //check if selected collection is supported in current config
    const collectionConfig = collectionFormConfig.find((c) => c.id === selectedCollection);
    if (!collectionConfig) {
      //remove collection related data from initial state if it is not supported
      delete initialState.selectedCollections?.[selectedCollection];
      delete initialState.maxCc?.[selectedCollection];
      delete initialState.selectedFilters?.[selectedCollection];
    } else {
      const selectedInstruments = selectedCollections[selectedCollection];
      Object.keys(selectedInstruments).forEach((selectedInstrument) => {
        //check if selected instrument is supported in current config
        const instrumentConfig = collectionConfig.instruments.find((i) => i.id === selectedInstrument);
        if (!instrumentConfig) {
          //remove instrument related data from initial state if it is not supported
          delete initialState.selectedCollections?.[selectedCollection]?.[selectedInstrument];
          delete initialState.maxCc?.[selectedCollection]?.[selectedInstrument];
        } else {
          const selectedProducts = selectedCollections[selectedCollection][selectedInstrument];
          Object.keys(selectedProducts).forEach((selectedProduct) => {
            //check if selected product type  is supported in current config
            const productConfig = instrumentConfig.productTypes.find((pt) => pt.id === selectedProduct);
            if (!productConfig) {
              //remove product type from initial state if it is not supported
              delete initialState.selectedCollections?.[selectedCollection]?.[selectedInstrument]?.[
                selectedProduct
              ];
            }
          });
        }
      });

      const selectedFiltersForCollection = selectedFilters?.[selectedCollection];
      if (selectedFiltersForCollection) {
        Object.keys(selectedFiltersForCollection).forEach((selectedFilter) => {
          //check if selected filter is supported in current config
          const additionalFiltersConfig = collectionConfig.additionalFilters?.find(
            (f) => f.id === selectedFilter,
          );

          if (!additionalFiltersConfig) {
            //remove selected filter from initial state if it is not supported
            delete initialState.selectedFilters?.[selectedCollection]?.[selectedFilter];
          }
        });
      }

      //set default values for additional filter if needed
      if (options?.setDefaultValues) {
        collectionConfig.additionalFilters
          ?.filter((df) => df.defaultValue !== undefined)
          .forEach((df) => {
            if (!selectedFilters[selectedCollection][df.id]) {
              initialState.selectedFilters[selectedCollection][df.id] = df.defaultValue;
            }
          });
      }
    }
  });

  return initialState;
};
