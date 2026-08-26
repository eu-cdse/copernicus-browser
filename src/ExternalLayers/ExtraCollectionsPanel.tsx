import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { t } from 'ttag';

import { EOBButton } from '../junk/EOBCommon/EOBButton/EOBButton';

import { authSlice, collapsiblePanelSlice, externalLayersSlice, notificationSlice } from '../store';
import { selectExternalLayers, ExternalServer } from '../store/slices/externalLayersSlice';
import { saveExternalServersToServer } from './externalServicesBackend';
import { useAppSelector } from '../hooks';
import {
  fetchWmsCapabilities,
  fetchWmtsCapabilities,
  getServiceEndpoint,
  isMeaningful,
  validateWmsUrl,
} from './externalLayers.utils';
import { FATHOM_TRACK_EVENT_LIST } from '../const';
import { handleFathomTrackEvent } from '../utils/fathom';
import CheckmarkSvg from '../Tools/VisualizationPanel/CollectionSelection/checkmark.svg?react';
import CollectionTooltip from '../Tools/VisualizationPanel/CollectionSelection/CollectionTooltip/CollectionTooltip';

import './ExtraCollectionsPanel.scss';

const ExtraCollectionsPanel = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const dispatch = useDispatch();
  const { servers, activeServerId } = useSelector(selectExternalLayers);
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = user?.access_token;
  // Logged-in users persist to the backend; anonymous users only ever hit localStorage (which can't
  // fail), so the strict "save first, then update the UI" flow below only applies when logged in.
  const isLoggedIn = !!(user?.userdata && accessToken);

  // A 401 from the backend save means the session has expired, not that the URL/service is bad;
  // surface the existing auth-expired banner instead of the generic error in that case.
  const handleBackendSaveError = (e: unknown, genericMessage: string) => {
    if ((e as { response?: { status?: number } })?.response?.status === 401) {
      dispatch(authSlice.actions.setUserAuthError(t`Your authentication has expired`));
    } else {
      dispatch(notificationSlice.actions.displayError(genericMessage));
    }
  };

  const handleLoad = async () => {
    if (!validateWmsUrl(url)) {
      setError(t`Invalid URL`);
      handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'invalid-url');
      return;
    }
    setError(null);
    setWarning(null);

    // Browsers block http:// requests from an https:// page (mixed content).
    if (window.location.protocol === 'https:' && /^http:\/\//i.test(url.trim())) {
      setError(t`This server must support HTTPS to be loaded here.`);
      handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'mixed-content');
      return;
    }

    const normalizedUrl = getServiceEndpoint(url.trim()).replace(/\/$/, '');
    const duplicate = servers.find(
      (s) => getServiceEndpoint(s.url.trim()).replace(/\/$/, '') === normalizedUrl,
    );
    if (duplicate) {
      setWarning(t`This server is already loaded as "${duplicate.name}".`);
      handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'duplicate');
      return;
    }

    setLoading(true);
    try {
      let result: Awaited<ReturnType<typeof fetchWmsCapabilities>> = null;
      // Initial guess from the URL; if it returns nothing we transparently try the other protocol.
      let resolvedType: 'WMS' | 'WMTS' = /wmts/i.test(url) ? 'WMTS' : 'WMS';
      try {
        result = resolvedType === 'WMS' ? await fetchWmsCapabilities(url) : await fetchWmtsCapabilities(url);
        if (!result) {
          resolvedType = resolvedType === 'WMS' ? 'WMTS' : 'WMS';
          result =
            resolvedType === 'WMS' ? await fetchWmsCapabilities(url) : await fetchWmtsCapabilities(url);
        }
      } catch (e) {
        const err = e as Error & { status?: number };
        if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
          setError(t`The server took too long to respond. Please try again.`);
          handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'timeout');
        } else if (err?.name === 'HttpError') {
          setError(t`The server returned an error (HTTP ${err.status}). Check the URL and try again.`);
          handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'http-error');
        } else {
          setError(
            t`Could not reach the server. It may be offline or may not allow cross-origin (CORS) access.`,
          );
          handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'network');
        }
        return;
      }

      if (!result) {
        setError(t`Could not load capabilities. Check the URL and try again.`);
        handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'no-capabilities');
        return;
      }

      // We only support WMS 1.1.1. We request capabilities as 1.1.1; if the server answered with a
      // different version it doesn't support 1.1.1 (e.g. a 1.3.0-only server), so reject it.
      if (resolvedType === 'WMS' && result.version !== '1.1.1') {
        setError(t`This server requires WMS ${result.version}, which isn't supported here (only WMS 1.1.1).`);
        handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'unsupported-version');
        return;
      }

      // Generate the id here (rather than letting the reducer do it) so the object we PUT to the
      // backend is identical to the one we dispatch.
      const newServer: ExternalServer = {
        id: uuid(),
        name: result.serviceTitle,
        url: getServiceEndpoint(url),
        type: resolvedType,
        version: result.version,
        format: result.format,
        infoFormat: result.infoFormat,
        serviceAbstract: result.serviceAbstract,
        accessConstraints: result.accessConstraints,
        fees: result.fees,
        layers: result.layers,
      };

      // Pessimistic save for logged-in users: persist to the backend first and only add the
      // collection to the UI if that succeeds, so a backend error doesn't leave the UI showing a
      // collection that was never saved. Anonymous users skip this (localStorage-only, can't fail).
      if (isLoggedIn) {
        try {
          await saveExternalServersToServer([...servers, newServer], accessToken as string);
        } catch (e) {
          // Surface the backend failure in the same error modal that pin saves use, and don't add
          // the collection to the UI (it was never saved).
          handleBackendSaveError(e, t`Unable to load the external service.`);
          handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADD_FAILED, 'backend-save-failed');
          return;
        }
      }

      dispatch(
        isLoggedIn
          ? // The backend PUT already happened above; tag the action so the persistence middleware
            // doesn't issue a redundant save.
            { ...externalLayersSlice.actions.addExternalServer(newServer), meta: { skipBackendSave: true } }
          : externalLayersSlice.actions.addExternalServer(newServer),
      );
      // Collapse the panel only on a successful load (this is the one moment we collapse).
      dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(false));
      handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_SERVICE_ADDED, resolvedType);

      setUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serverId: string) => {
    setError(null);
    // Pessimistic delete for logged-in users: persist the shortened list to the backend first and
    // only remove the collection from the UI if that succeeds (matches the reviewer's request that a
    // failed backend delete must surface an error and not silently drop the collection from the UI).
    if (isLoggedIn) {
      const nextServers = servers.filter((s) => s.id !== serverId);
      setDeletingServerId(serverId);
      try {
        await saveExternalServersToServer(nextServers, accessToken as string);
      } catch (e) {
        // Surface the backend failure in the same error modal that pin saves use, and keep the
        // collection in the list (the delete was never persisted).
        handleBackendSaveError(e, t`Unable to remove the external service.`);
        return;
      } finally {
        setDeletingServerId(null);
      }
      dispatch({
        ...externalLayersSlice.actions.removeExternalServer(serverId),
        meta: { skipBackendSave: true },
      });
      return;
    }
    dispatch(externalLayersSlice.actions.removeExternalServer(serverId));
  };

  return (
    <div className="extra-collections-panel">
      <div className="extra-collections-url-row">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            const newUrl = e.target.value;
            setUrl(newUrl);
            setError(null);
            setWarning(null);
          }}
          onKeyDown={(e) => {
            // Mirror the Load button's disabled={loading || !url} so Enter can't fire a second
            // parallel fetch that races on the shared loading/error/warning state.
            if (e.key === 'Enter' && !loading && url) {
              handleLoad();
            }
          }}
          placeholder={t`Enter a WMS or WMTS URL`}
          className="extra-collections-url-input"
          disabled={loading}
        />
        <button
          onClick={handleLoad}
          disabled={loading || !url}
          className="eob-btn extra-collections-load-btn"
          title={t`Load`}
          aria-label={t`Load`}
        >
          {loading ? <i className="fas fa-spinner fa-spin fa-fw" /> : '+'}
        </button>
      </div>

      {error && <div className="extra-collections-error">{error}</div>}
      {warning && <div className="extra-collections-warning">{warning}</div>}

      {servers.length > 0 && (
        <div className="collection-buttons-container">
          <div className="collection-buttons-wrapper">
            {servers.map((server) => {
              const isActive = activeServerId === server.id;
              // All service-level metadata (description + access constraints + fees) is surfaced in a
              // single info tooltip on the server row, one item per line, rather than stretched across
              // the top of the layer list. "none"-style access constraints/fees are treated as absent.
              // GetCapabilities values are plain text, so wrap any bare http(s) URL (e.g. a copyright
              // link in AccessConstraints) as a markdown link — the tooltip's pipeline only enhances
              // existing anchors, it doesn't auto-link bare URLs.
              const linkify = (text: string): string => text.replace(/(https?:\/\/[^\s)]+)/g, '[$1]($1)');
              const serverInfo = [
                server.serviceAbstract ? linkify(server.serviceAbstract) : null,
                isMeaningful(server.accessConstraints)
                  ? `**${t`Access constraints`}:** ${linkify(server.accessConstraints as string)}`
                  : null,
                isMeaningful(server.fees) ? `**${t`Fees`}:** ${linkify(server.fees as string)}` : null,
              ]
                .filter(Boolean)
                .join('\n\n');
              return (
                <div className="single-collection-wrapper" key={server.id}>
                  <EOBButton
                    text={
                      <>
                        <span className="collection-button-title">{server.name}</span>
                        {isActive && <CheckmarkSvg />}
                      </>
                    }
                    title={server.name}
                    className={`collection-button secondary ${isActive ? 'selected' : ''}`}
                    onClick={() => {
                      // Re-clicking the already-selected collection is a no-op; otherwise it would
                      // reset the active layer back to the server's first layer.
                      if (!isActive) {
                        dispatch(externalLayersSlice.actions.setActiveExternalServer(server.id));
                      }
                    }}
                  />
                  {serverInfo && (
                    <CollectionTooltip
                      source={serverInfo}
                      title={undefined}
                      credits={undefined}
                      className=""
                    />
                  )}
                  <button
                    className="external-collection-delete-btn"
                    title={t`Remove collection`}
                    disabled={deletingServerId === server.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(server.id);
                    }}
                  >
                    <i
                      className={`fas ${deletingServerId === server.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraCollectionsPanel;
