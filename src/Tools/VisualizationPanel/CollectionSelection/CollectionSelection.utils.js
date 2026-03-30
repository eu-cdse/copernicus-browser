import moment from 'moment';
import { dataSourceHandlers } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { credits } from '../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/credits';
import { findLatestDateWithData } from '../../../utils/latestDate.utils';
import store, { visualizationSlice } from '../../../store';
import { DATASOURCES } from '../../../const';

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

// CLMS (raster) and CLMS Vector datasets are handled by separate DataSourceHandlers,
// which results in them being registered as two separate collection groups. From the
// user's perspective, however, they belong to the same product family (Copernicus Land
// Monitoring Service) and should appear as a single group in the UI. This function merges
// the two groups into one, placing the combined group at the original position of the CLMS
// group so the overall ordering of the collection list is not affected.
const mergeCLMSGroups = (groups) => {
  const clmsGroup = groups.find((g) => g.datasource === DATASOURCES.CLMS);
  const clmsVectorGroup = groups.find((g) => g.datasource === DATASOURCES.CLMS_VECTOR);

  if (!clmsGroup || !clmsVectorGroup) {
    return groups;
  }

  const mergedGroup = {
    ...clmsGroup,
    collections: [...(clmsGroup.collections || []), ...(clmsVectorGroup.collections || [])],
    searchTags: [...new Set([...clmsGroup.searchTags, ...clmsVectorGroup.searchTags])],
  };

  return groups.reduce((acc, g) => {
    if (g.datasource === DATASOURCES.CLMS) {
      acc.push(mergedGroup);
    } else if (g.datasource !== DATASOURCES.CLMS_VECTOR) {
      acc.push(g);
    }
    return acc;
  }, []);
};

const createCollectionGroupsFromDataSourceHandlers = (filter, bounds) => {
  const collectionGroups = dataSourceHandlers
    .filter((dsh) => dsh.isHandlingAnyUrl())
    .map((dsh) => {
      const datasets = dsh.datasets ? dsh.datasets.filter((ds) => !dsh.isOnlyForBaseLayer(ds)) : [];
      const collections = datasets.length
        ? datasets.map((dataset) => {
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
        : undefined;

      return {
        title: dsh.getSearchGroupLabel(),
        datasource: dsh.datasource,
        searchTags: [dsh.getSearchGroupLabel()],
        displayedAsGroup: dsh.isDisplayedAsGroup(),
        getDescription: () => dsh.getDescription(),
        credits: credits[dsh.datasource],
        preselectedDataset: dsh.getPreselectedDataset(bounds),
        collections: collections,
      };
    })
    .filter((collectionGroup) => !!collectionGroup.collections)
    .filter((collectionGroup) => checkFilter(collectionGroup, filter))
    .map((collectionGroup) => {
      const filteredCollections = collectionGroup?.collections?.filter((c) => checkFilter(c, filter)) || [];
      return { ...collectionGroup, collections: [...filteredCollections] };
    });

  // Merge CLMS groups (CLMS and CLMS Vector)
  const mergedCollectionGroups = mergeCLMSGroups(collectionGroups);

  return mergedCollectionGroups;
};

const getSelectedCollectionTitle = (selected) => {
  const collectionGroups = createCollectionGroupsFromDataSourceHandlers();
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

    if (!fromTime.isValid() || !toTime.isValid()) {
      return;
    }

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

export {
  createCollectionGroupsFromDataSourceHandlers,
  getSelectedCollectionTitle,
  displayLatestDateOnSelect,
};
