import { CancelToken, isCancelled } from '@sentinel-hub/sentinelhub-js';
import { useEffect, useState } from 'react';
import { initializeStatisticsLayer } from './PixelExplorer.utils';

let cancelToken = new CancelToken();

const usePixelExplorer = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [params, setParams] = useState({});

  useEffect(() => {
    //cancel all requests when component is unmounted
    return () => {
      if (cancelToken) {
        cancelToken.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const getValue = async (requestCancelToken) => {
      try {
        setLoading(true);
        const { enabled, statisticsLayer, indexValueFetchingFunction } = await initializeStatisticsLayer(
          params,
        );
        setEnabled(enabled);
        if (enabled) {
          const indexValue = await indexValueFetchingFunction(statisticsLayer, {
            ...params,
            cancelToken: requestCancelToken,
          });
          setResult({ title: statisticsLayer.title, value: indexValue });
        } else {
          setResult(null);
        }
        setLoading(false);
      } catch (e) {
        if (!isCancelled(e)) {
          console.error(e.message);
          setEnabled(false);
          setLoading(false);
        }
        setResult(null);
      }
    };
    //cancel previous requests in progress and create new cancel token
    if (cancelToken) {
      cancelToken.cancel();
    }
    cancelToken = new CancelToken();
    getValue(cancelToken);
  }, [params]);

  return [{ enabled, loading, result }, setParams];
};

export default usePixelExplorer;
