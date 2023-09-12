import FileSaver from 'file-saver';
import { useState, useEffect } from 'react';
import { oDataApi } from '../api/OData/ODataApi';
import { ODataEntity } from '../api/OData/ODataTypes';

export const useODataDownload = () => {
  const [downloadParams, setDownloadParams] = useState(null);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    const executeDownload = async (downloadParams) => {
      const { name, token, cancelToken, id, setProgress = () => {}, nodeUri = null } = downloadParams;
      setDownloadInProgress(true);
      setDownloadError(null);
      if (!id || !downloadParams || !downloadParams.token) {
        setDownloadInProgress(false);
        setDownloadError(null);
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
          (progress) => setProgress(id, progress),
          cancelToken,
        );

        if (data) {
          FileSaver.saveAs(data, name);
        }
      } catch (e) {
        setDownloadError(e);
      } finally {
        setDownloadInProgress(false);
        setProgress(id, null);
      }
    };
    if (downloadParams) {
      executeDownload(downloadParams);
    }
  }, [downloadParams]);

  return [{ downloadInProgress, downloadError }, setDownloadParams];
};
