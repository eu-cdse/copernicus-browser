import { useEffect, useState } from 'react';
import { t } from 'ttag';
import { ExternalFeatureInfoResult } from './FeatureInfo.utils';

// Shared loading/error/result state for a GetFeatureInfo request. The `request` thunk is run
// whenever `deps` change; a stale-guard prevents a late response from overwriting a newer one.
// Shares this cancelled-effect stale-guard shape with useExternalServerLayers
// (src/ExternalLayers/useExternalServerLayers.ts); kept separate since the two evolve independently.
/**
 * @param request A thunk that performs the GetFeatureInfo request. It is re-invoked **only when
 *   `deps` change**, not on every render — so it is safe to pass an inline arrow function.
 * @param deps Dependency list controlling re-execution. Callers MUST list every variable captured
 *   by `request`; a missing entry causes a stale closure (ESLint cannot verify this forwarded list).
 */
export function useFeatureInfoRequest(
  request: () => Promise<ExternalFeatureInfoResult>,
  deps: ReadonlyArray<unknown>,
): { loading: boolean; error: string | null; result: ExternalFeatureInfoResult } {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExternalFeatureInfoResult>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setResult(null);
    request()
      .then((res) => {
        if (!cancelled) {
          setResult(res);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.error('GetFeatureInfo request failed', err);
          setError(t`Failed to load feature info.`);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { loading, error, result };
}
