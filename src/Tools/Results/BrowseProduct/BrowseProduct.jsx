import { useEffect, useState } from 'react';
import { t } from 'ttag';
import FileTree from './FileTree';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import './BrowseProduct.scss';
import { getRootNodeUri, useListNodes } from './BrowseProduct.utils';
import Loader from '../../../Loader/Loader';

export const BROWSE_PRODUCT_ENABLED = true;

const BrowseProduct = ({ product, downloadInProgress, onDownload, onClose, userToken }) => {
  const [expandedNodes, setExpandedNodes] = useState();
  const [rootNode, setRootNode] = useState();
  const [nodes, setNodes] = useState();

  const { result, loading, setParams } = useListNodes();

  useEffect(() => {
    if (userToken && product) {
      setParams({
        nodeUri: getRootNodeUri(product),
        token: userToken,
        isRoot: true,
      });
    }
  }, [product, userToken, setParams]);

  useEffect(() => {
    if (result) {
      const root = {
        Id: product.name,
        Name: product.name,
        ContentLength: 0,
        ChildrenNumber: result?.length,
        Nodes: {
          uri: getRootNodeUri(product),
        },
      };
      setNodes((prevState) => ({ ...prevState, [root.Nodes.uri]: result }));
      setExpandedNodes([root.Nodes.uri]);
      setRootNode(root);
    }
  }, [result, product]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="browse-product">
      <div className="browse-product-content">
        <FileTree
          rootNode={rootNode}
          nodes={nodes}
          setNodes={setNodes}
          expandedNodes={expandedNodes}
          setExpandedNodes={setExpandedNodes}
          product={product}
          userToken={userToken}
        />
      </div>
      {onDownload && (
        <div className="actions">
          <EOBButton
            disabled={downloadInProgress}
            loading={downloadInProgress}
            icon="download"
            className="small"
            text={t`Download full product`}
            title={`${t`Download full product`}`}
            onClick={() => {
              onDownload();
              onClose();
            }}
          ></EOBButton>
        </div>
      )}
    </div>
  );
};

export default BrowseProduct;
