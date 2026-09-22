import { useCallback, useEffect, useState } from 'react';

import { AppDispatch, useAppDispatch } from '../hooks';
import { ExternalServer, externalLayersSlice } from '../store/slices/externalLayersSlice';
import { singleFlight } from '../utils/singleFlight';
import {
  classifyCapabilitiesError,
  fetchCapabilities,
  getNoCapabilitiesResultError,
} from './externalLayers.utils';

interface UseExternalServerLayersResult {
  loading: boolean;
  error: string | null;
  retry: () => void;
}

interface CapabilitiesOutcome {
  error: string | null;
}

type ServerToFetch = Pick<ExternalServer, 'id' | 'url' | 'type'>;

// Keyed by server id so a double click, a re-render, or several components/callers asking for the
// same server's capabilities at once share a single GetCapabilities request instead of firing one
// each. Shared by PinPanel.jsx, which restores a server imperatively outside this hook.
const inFlight = new Map<string, Promise<CapabilitiesOutcome>>();

export const fetchServerCapabilities = (
  server: ServerToFetch,
  dispatch: AppDispatch,
): Promise<CapabilitiesOutcome> =>
  singleFlight(inFlight, server.id, () => {
    return fetchCapabilities(server.type, server.url)
      .then((result): CapabilitiesOutcome => {
        if (!result) {
          return { error: getNoCapabilitiesResultError().message };
        }
        dispatch(
          externalLayersSlice.actions.updateServerLayers({
            serverId: server.id,
            layers: result.layers,
            serviceAbstract: result.serviceAbstract,
            accessConstraints: result.accessConstraints,
            fees: result.fees,
          }),
        );
        return { error: null };
      })
      .catch((e): CapabilitiesOutcome => ({ error: classifyCapabilitiesError(e).message }));
  });

// Fetches a server's layers from GetCapabilities on demand and caches them in Redux for the rest of
// the session (see updateServerLayers) — a no-op once `server.layers` is already populated, whether
// from a prior fetch this session or a legacy record that still carries them. See #1236.
// Shares its cancelled-effect stale-guard shape with useFeatureInfoRequest
// (src/Controls/FeatureInfo/useFeatureInfoRequest.ts); kept separate since the two evolve
// independently. The dependency array below includes `server` by object identity (it changes on
// every updateServerLayers dispatch), but the `hasLayers` guard makes that a safe no-op re-run.
export function useExternalServerLayers(server: ExternalServer | undefined): UseExternalServerLayersResult {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped by retry() to force the effect below to re-run the fetch for the same server.
  const [attempt, setAttempt] = useState(0);

  const serverId = server?.id;
  const hasLayers = !!server?.layers?.length;

  useEffect(() => {
    if (!server || hasLayers) {
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchServerCapabilities(server, dispatch).then((outcome) => {
      // Ignore a resolved fetch that belongs to a server we've since navigated away from (fast
      // click-through) or a component that has since unmounted.
      if (cancelled) {
        return;
      }
      setLoading(false);
      setError(outcome.error);
    });

    return () => {
      cancelled = true;
    };
  }, [server, serverId, hasLayers, dispatch, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { loading, error, retry };
}
