import { t } from 'ttag';

import { getFileIcon, getNodeValueUri, handleError } from './BrowseProduct.utils';
import { useODataDownload } from '../../../hooks/useODataDownload';
import { useEffect } from 'react';

export const FileNode = ({ node, selected, setSelected, product, userToken }) => {
  const [{ downloadInProgress, downloadError }, setDownloadParams] = useODataDownload();

  useEffect(() => {
    if (downloadError) {
      handleError(downloadError);
    }
  }, [downloadError]);

  return (
    <div
      className={`file ${selected === node.Path ? 'selected' : ''}`}
      onClick={() => setSelected(node.Nodes.uri)}
      title={node.Name}
    >
      <i className={`fa ${getFileIcon(node.Name)}`} />
      {node.Name}
      {!downloadInProgress && (
        <i
          className={`fa fa-download download`}
          onClick={() =>
            setDownloadParams({
              id: product.id,
              name: node.Name,
              token: userToken,
              nodeUri: getNodeValueUri(node),
            })
          }
          title={t`Download`}
        />
      )}
      {downloadInProgress && (
        <span>
          <i className={`fa fa-spinner fa-spin fa-fw`} />
        </span>
      )}
    </div>
  );
};
