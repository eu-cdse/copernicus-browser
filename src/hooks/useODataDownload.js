import FileSaver from 'file-saver';
import { useState, useEffect } from 'react';
import { oDataApi } from '../api/OData/ODataApi';
import { ODataEntity } from '../api/OData/ODataTypes';

export const useODataDownload = () => {
  const [downloadParams, setDownloadParams] = useState(null);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const executeDownload = async (downloadParams) => {
      const { name, token, cancelToken, id, setProgress = () => {}, nodeUri = null } = downloadParams;

      if (!isMounted) {
        return;
      }
      setDownloadInProgress(true);
      setDownloadError(null);

      if (!id || !downloadParams || !downloadParams.token) {
        if (isMounted) {
          setDownloadInProgress(false);
          setDownloadError(null);
        }
        if (id) {
          setProgress(id, null);
        }
        return;
      }

      setProgress(id, 0);

      try {
        const data = await oDataApi.download(
          token,
          ODataEntity.Products,
          id,
          nodeUri,
          (progress) => {
            // Only update progress if component is still mounted and download hasn't been aborted
            if (isMounted && cancelToken?.signal?.aborted === false) {
              setProgress(id, progress);
            }
          },
          cancelToken,
        );

        if (data && isMounted) {
          FileSaver.saveAs(data, name);
        }
      } catch (e) {
        // Ignore abort errors - they occur when the user cancels the download
        if (e.name !== 'AbortError' && isMounted) {
          setDownloadError(e);
        }
      } finally {
        if (isMounted) {
          setDownloadInProgress(false);
          setProgress(id, null);
        }
      }
    };

    if (downloadParams) {
      executeDownload(downloadParams);
    }

    return () => {
      isMounted = false;
    };
  }, [downloadParams]);

  return [{ downloadInProgress, downloadError }, setDownloadParams];
};
