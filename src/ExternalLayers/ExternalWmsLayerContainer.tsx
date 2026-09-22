import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { t } from 'ttag';

import { selectExternalLayers } from '../store/slices/externalLayersSlice';
import { useAppSelector } from '../hooks';
import { createLayerActions } from '../Tools/VisualizationPanel/VisualizationLayer/createLayerActions';
import Loader from '../Loader/Loader';
import { EOBButton } from '../junk/EOBCommon/EOBButton/EOBButton';
import { useExternalServerLayers } from './useExternalServerLayers';
import ExternalWmsLayerItem from './ExternalWmsLayerItem';
import ExternalWmsLayerSearch from './ExternalWmsLayerSearch';
import ExternalWmsLayerPagination from './ExternalWmsLayerPagination';

import './ExternalWmsLayerContainer.scss';

interface Props {
  savePin?: () => void;
  toggleLayerActions?: (e: React.MouseEvent) => void;
  layerActionsOpen?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ExternalWmsLayerContainer = ({ savePin, toggleLayerActions, layerActionsOpen }: Props) => {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const { servers, activeServerId, activeLayerId } = useAppSelector(selectExternalLayers);
  const { zoom, lat, lng, is3D } = useAppSelector((state) => state.mainMap);
  const user = useAppSelector((state) => state.auth.user);

  const server = useMemo(
    () => servers.find((s: { id: string; url: string; type: string }) => s.id === activeServerId),
    [servers, activeServerId],
  );

  const {
    loading: layersLoading,
    error: layersError,
    retry: retryLoadLayers,
  } = useExternalServerLayers(server);

  useEffect(() => {
    setPage(0);
  }, [filter, activeServerId, pageSize]);

  const matchesFilter = useCallback(
    (layer: { title: string; name: string }, filterValue: string): boolean => {
      const terms = filterValue.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) {
        return true;
      }
      const title = layer.title.toLowerCase();
      const name = layer.name.toLowerCase();
      return terms.every((term) => title.includes(term) || name.includes(term));
    },
    [],
  );

  useEffect(() => {
    if (!activeLayerId || !server?.layers?.length) {
      return;
    }
    const allLayers = server.layers ?? [];
    const filteredLayers = filter ? allLayers.filter((l) => matchesFilter(l, filter)) : allLayers;
    const idx = filteredLayers.findIndex((l) => l.id === activeLayerId);
    if (idx >= 0) {
      setPage(Math.floor(idx / pageSize));
    }
  }, [activeLayerId, server, filter, pageSize, matchesFilter]);

  if (!server) {
    return null;
  }

  const layers = server.layers ?? [];
  const filtered = filter ? layers.filter((l) => matchesFilter(l, filter)) : layers;
  // While the lazy fetch is in flight there are no layers to show yet — suppress the "No layers
  // match" empty state, which would otherwise flash on every load.
  const showLoader = layersLoading && layers.length === 0;
  const showError = !showLoader && !!layersError && layers.length === 0;

  // At least 1 so an empty filter result shows "1 / 1" instead of a confusing "1 / 0".
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const layerActions = createLayerActions({ zoom, lat, lng, is3D, savePin, user });

  return (
    <div className="layer-selection external-wms-layer-container has-pagination">
      <div className="layer-header">
        <div className="layer-title">{t`Layers`}:</div>
      </div>

      {layers.length > 0 && (
        <ExternalWmsLayerSearch
          filter={filter}
          onFilterChange={setFilter}
          filteredCount={filtered.length}
          totalCount={layers.length}
        />
      )}

      <div className="external-wms-layer-list" role="listbox">
        {showLoader && <Loader />}

        {!showLoader &&
          paginated.map((layer) => (
            <ExternalWmsLayerItem
              key={`${server.id}:${layer.id}`}
              server={server}
              layer={layer}
              isActive={layer.id === activeLayerId}
              layerActions={layerActions}
              layerActionsOpen={layerActionsOpen}
              toggleLayerActions={toggleLayerActions}
            />
          ))}

        {showError && (
          <div className="external-wms-layer-error">
            <div>{layersError}</div>
            <EOBButton text={t`Retry`} icon="refresh" onClick={retryLoadLayers} />
          </div>
        )}

        {!showLoader && !showError && filtered.length === 0 && (
          <div className="external-wms-layer-empty">{t`No layers match`}</div>
        )}
      </div>

      <ExternalWmsLayerPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default ExternalWmsLayerContainer;
