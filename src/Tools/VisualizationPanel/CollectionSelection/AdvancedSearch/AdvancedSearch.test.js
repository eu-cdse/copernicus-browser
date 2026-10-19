import { AdvancedSearch } from './AdvancedSearch';

/**
 * setSelectedFilters reads/writes this.state via a setState updater function. Rather than
 * mounting the full component (heavy Redux/HOC/componentDidMount dependencies, no
 * enzyme/react-test-renderer available in this project), we instantiate the raw class and
 * shadow setState with a synchronous version that applies the updater immediately - enough to
 * exercise this method's logic in isolation.
 */
const createInstance = (selectedFilters = {}) => {
  const instance = new AdvancedSearch({});
  instance.state = {
    ...instance.state,
    collectionForm: {
      ...instance.state.collectionForm,
      selectedCollections: {},
      maxCc: {},
      selectedFilters,
    },
  };
  instance.setState = (updater) => {
    instance.state = { ...instance.state, ...updater(instance.state) };
  };
  return instance;
};

describe('AdvancedSearch.setSelectedFilters', () => {
  it('sets a filter value for a collection', () => {
    const instance = createInstance();
    instance.setSelectedFilters('collectionA', 'cloudCover', 42);
    expect(instance.state.collectionForm.selectedFilters).toEqual({
      collectionA: { cloudCover: 42 },
    });
  });

  it.each([
    ['empty string', ''],
    ['null', null],
    ['undefined', undefined],
    ['empty array', []],
  ])('removes the filter when the value is %s', (_label, emptyValue) => {
    const instance = createInstance({ collectionA: { cloudCover: 42 } });
    instance.setSelectedFilters('collectionA', 'cloudCover', emptyValue);
    expect(instance.state.collectionForm.selectedFilters.collectionA?.cloudCover).toBeUndefined();
  });

  it('keeps a non-empty array value', () => {
    const instance = createInstance();
    instance.setSelectedFilters('collectionA', 'orbitDirection', ['ASCENDING']);
    expect(instance.state.collectionForm.selectedFilters).toEqual({
      collectionA: { orbitDirection: ['ASCENDING'] },
    });
  });

  it('keeps 0 as a valid non-empty value', () => {
    const instance = createInstance();
    instance.setSelectedFilters('collectionA', 'cloudCover', 0);
    expect(instance.state.collectionForm.selectedFilters).toEqual({
      collectionA: { cloudCover: 0 },
    });
  });

  it('does not affect filters of other collections', () => {
    const instance = createInstance({ collectionB: { cloudCover: 10 } });
    instance.setSelectedFilters('collectionA', 'cloudCover', 42);
    expect(instance.state.collectionForm.selectedFilters).toEqual({
      collectionA: { cloudCover: 42 },
      collectionB: { cloudCover: 10 },
    });
  });
});
