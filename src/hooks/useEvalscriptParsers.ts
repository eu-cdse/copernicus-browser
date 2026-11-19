import { useCallback, useEffect, useState } from 'react';
import { areEvalscriptParsersLoaded, loadEvalscriptParsers } from '../utils/evalscriptParsers';

export type EvalscriptParsersState = {
  ready: boolean;
  error: Error | null;
  retry: () => void;
};

// Starts loading the evalscript parsers (esprima/escodegen) and re-renders once they are available.
// If loading fails (e.g. network error or a stale chunk after a deploy), `error` is set and `retry`
// starts a new load attempt (loadEvalscriptParsers clears its cached promise on failure).
export function useEvalscriptParsers(): EvalscriptParsersState {
  const [ready, setReady] = useState<boolean>(areEvalscriptParsersLoaded());
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    if (ready) {
      return;
    }
    let isMounted = true;
    loadEvalscriptParsers()
      .then(() => {
        if (isMounted) {
          setReady(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load evalscript parsers', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      });
    return () => {
      isMounted = false;
    };
  }, [ready, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  return { ready, error, retry };
}
