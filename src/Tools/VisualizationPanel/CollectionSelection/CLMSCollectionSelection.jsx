import React from 'react';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';

import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { credits } from '../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/credits';
import CollectionTooltip from './CollectionTooltip/CollectionTooltip';

import CheckmarkSvg from './checkmark.svg?react';

import './CLMSCollectionSelection.scss';
import { connect } from 'react-redux';
import store, { clmsSlice } from '../../../store';
import { CLMS_OPTIONS, DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX } from './CLMSCollectionSelection.utils';

function* walk(xs, path = []) {
  for (let x of xs) {
    const newPath = path.concat(x);
    yield newPath;
    yield* walk(x.options || [], newPath);
  }
}

const ancestry = (pred) => (obj) => {
  for (let nodes of walk(obj)) {
    if (pred(nodes.at(-1))) {
      return nodes;
    }
  }
  return [];
};

const findAncestryById = (targetId) => ancestry(({ id }) => id === targetId);

function Breadcrumbs({
  datasource,
  menus,
  onSelect,
  selectedPath,
  selectedCollection,
  selectedConsolidationPeriodIndex,
}) {
  const onPathChange = (id) => {
    store.dispatch(clmsSlice.actions.setSelectedPath(id));
    store.dispatch(clmsSlice.actions.setSelectedCollection(null));
  };

  const ancestors = findAncestryById(selectedPath)(menus);
  const parent = ancestors.at(-1);
  const selectedNodeOptions = selectedPath === null ? menus : parent ? parent.options ?? [] : [];

  return (
    <div className="breadcrumb-wrapper">
      <div className="breadcrumb-header">
        {ancestors.map((h, index) => {
          const isLastItem = index === ancestors.length - 1;
          if (isLastItem) {
            return (
              <div className="item abbreviate" onClick={() => onPathChange(h.id)} key={index} title={h.label}>
                {h.label}
              </div>
            );
          }

          const isFirstItem = index === 0;
          const isSecondLastItem = index === ancestors.length - 2;
          if (isFirstItem || isSecondLastItem) {
            return (
              <React.Fragment key={index}>
                <div
                  className={`item ${isSecondLastItem ? 'abbreviate' : ''}`}
                  onClick={() => onPathChange(h.id)}
                  title={h.label}
                >
                  {h.label}
                </div>
                <div className="breadcrumb-divider">
                  <i className="fa fa-chevron-right" />
                </div>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={index}>
              <div className="item">{`...`}</div>
              <div className="breadcrumb-divider">
                <i className="fa fa-chevron-right" />
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="collection-buttons-wrapper">
        {selectedNodeOptions.map((item, i) => {
          const dsh = getDataSourceHandler(item.id);
          const descriptionForDataset = dsh?.getDescriptionForDataset(item.id);
          const itemLabel = dsh?.getDatasetSearchLabels()[item.id] ?? item.label;

          return (
            <React.Fragment key={i}>
              <div className="single-collection-wrapper">
                <EOBButton
                  className={`collection-button secondary  ${
                    selectedCollection === item.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    if (item.options) {
                      onPathChange(item.id);
                    } else {
                      onSelect({ datasource: datasource, dataset: item.id });
                      store.dispatch(clmsSlice.actions.setSelectedCollection(item.id));
                    }
                    store.dispatch(
                      clmsSlice.actions.setSelectedConsolidationPeriodIndex(
                        DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX,
                      ),
                    );
                  }}
                  key={item.id}
                  text={
                    <>
                      {itemLabel}
                      {selectedCollection === item.id ? <CheckmarkSvg /> : null}
                    </>
                  }
                />

                <CollectionTooltip
                  source={descriptionForDataset}
                  credits={credits[item.id]}
                  className={descriptionForDataset ? '' : 'hidden-tooltip'}
                />
              </div>
              {selectedCollection === item.id && item.consolidationPeriods && (
                <div className="consolidation-period-wrapper">
                  {item.consolidationPeriods.map((cp, idx) => {
                    return (
                      <EOBButton
                        key={cp.label}
                        className={`collection-button secondary consolidation-period ${
                          idx === selectedConsolidationPeriodIndex ? 'active' : ''
                        }`}
                        text={cp.label}
                        onClick={() => {
                          store.dispatch(clmsSlice.actions.setSelectedConsolidationPeriodIndex(idx));
                          onSelect({ datasource: datasource, dataset: cp.id });
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function CLMSCollectionSelection({
  datasource,
  onSelect,
  selectedPath,
  selectedCollection,
  selectedConsolidationPeriodIndex,
}) {
  return (
    <Breadcrumbs
      menus={[{ label: datasource, id: datasource, options: CLMS_OPTIONS }]}
      datasource={datasource}
      onSelect={onSelect}
      selectedPath={selectedPath || datasource}
      selectedCollection={selectedCollection}
      selectedConsolidationPeriodIndex={selectedConsolidationPeriodIndex}
    />
  );
}

const mapStoreToProps = (store) => ({
  selectedPath: store.clms.selectedPath,
  selectedCollection: store.clms.selectedCollection,
  selectedConsolidationPeriodIndex: store.clms.selectedConsolidationPeriodIndex,
});

export default connect(mapStoreToProps, null)(CLMSCollectionSelection);
