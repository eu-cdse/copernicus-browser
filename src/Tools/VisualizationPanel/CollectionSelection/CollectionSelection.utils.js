import moment from 'moment';
import { dataSourceHandlers } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { credits } from '../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/credits';
import { findLatestDateWithData } from '../SmartPanel/LatestDataAction.utils';
import store, { visualizationSlice } from '../../../store';

const checkFilter = (item, filter) => {
  if (!filter) {
    return true;
  }
  //create list of regEx for each word in filter
  let regexes = filter
    .split(' ')
    .filter((s) => !!s) //remove empty spaces
    .map((f) => new RegExp(f, 'i'));

  //test if collection search tags matches any of filtering expressions
  if (regexes.some((re) => item.searchTags.some((tag) => tag.match(re)))) {
    return true;
  }
  //test if any of children matches filter
  if (item.collections && item.collections.length) {
    return item.collections.some((collection) => checkFilter(collection, filter));
  }
  return false;
};

const createCollectionGropsFromDataSourceHandlers = (filter, bounds) => {
  const collectionGroups = dataSourceHandlers
    .filter((dsh) => dsh.isHandlingAnyUrl())
    .map((dsh) => ({
      title: dsh.getSearchGroupLabel(),
      datasource: dsh.datasource,
      searchTags: [dsh.getSearchGroupLabel()],
      displayedAsGroup: dsh.isDisplayedAsGroup(),
      getDescription: () => dsh.getDescription(),
      credits: credits[dsh.datasource],
      preselectedDataset: dsh.getPreselectedDataset(bounds),
      collections:
        dsh.datasets && dsh.datasets.length
          ? dsh.datasets.map((dataset) => {
              const title = dsh.getDatasetSearchLabels() ? dsh.getDatasetSearchLabels()[dataset] : null;
              const searchTags = [title, dataset, dsh.getSearchGroupLabel()].filter((t) => !!t);
              return {
                title: title || dataset,
                getDescription: () => dsh.getDescriptionForDataset(dataset),
                credits: credits[dataset],
                datasource: dsh.datasource,
                dataset: dataset,
                searchTags: searchTags,
              };
            })
          : undefined,
    }))
    .filter((collectionGroup) => checkFilter(collectionGroup, filter))
    .map((collectionGroup) => {
      const filteredCollections = collectionGroup?.collections?.filter((c) => checkFilter(c, filter)) || [];
      return { ...collectionGroup, collections: [...filteredCollections] };
    });

  return collectionGroups;
};

const getSelectedCollectionTitle = (selected) => {
  const collectionGroups = createCollectionGropsFromDataSourceHandlers();
  const collectionGroup = collectionGroups.find((cg) => cg.datasource === selected.datasource);

  const collection =
    collectionGroup &&
    collectionGroup.collections &&
    collectionGroup.collections.find((c) => c.dataset === selected.dataset);

  let title = collectionGroup?.title;

  if (collection && collection.title) {
    if (collectionGroup && collectionGroup.collections && collectionGroup.collections.length === 1) {
      title = collection.title;
    } else {
      title = `${title} ${collection.title}`;
    }
  }
  return title;
};

async function displayLatestDateOnSelect({ datasetId, bounds, pixelBounds, maxCloudCover, orbitDirection }) {
  try {
    const latestDate = await findLatestDateWithData({
      datasetId: datasetId,
      bounds,
      pixelBounds,
      maxCloudCover,
      orbitDirection,
    });
    const fromTime = moment(latestDate).utc().startOf('day');
    const toTime = moment(latestDate).utc().endOf('day');
    store.dispatch(
      visualizationSlice.actions.setVisualizationTime({
        fromTime: fromTime,
        toTime: toTime,
      }),
    );
  } catch (e) {
    console.error('Unable to find latest date with data', e.message);
  }
}

export { createCollectionGropsFromDataSourceHandlers, getSelectedCollectionTitle, displayLatestDateOnSelect };
