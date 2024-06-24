import React, { useEffect } from 'react';

import { useListNodes } from './BrowseProduct.utils';

export const FolderNode = ({
  isExpanded,
  node,
  userToken,
  isRoot,
  nodes,
  setNodes,
  setExpandedNodes,
  expandedNodes,
}) => {
  const { result, loading, setParams } = useListNodes();

  useEffect(() => {
    if (result) {
      setNodes((prevState) => ({ ...prevState, [node.Nodes.uri]: result }));
      setExpandedNodes([...expandedNodes, node.Nodes.uri]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const onClick = () => {
    if (loading) {
      return;
    }

    if (!nodes[node.Nodes.uri]) {
      setParams({
        nodeUri: node.Nodes.uri,
        token: userToken,
      });
    } else {
      if (isExpanded) {
        setExpandedNodes(expandedNodes.filter((nodeUri) => nodeUri !== node.Nodes.uri));
      } else {
        setExpandedNodes([...expandedNodes, node.Nodes.uri]);
      }
    }
  };

  return (
    <div
      onClick={isRoot ? null : onClick}
      className={`folder ${isExpanded ? 'expanded' : 'collapsed'} ${isRoot ? 'root' : ''}`}
      title={node.Name}
    >
      {isExpanded ? <i className={`fa fa-folder-open-o`} /> : <i className={`fa fa-folder-o`} />}
      {node.Name}
      {loading && (
        <span>
          <i className="fa fa-spinner fa-spin fa-fw" />
        </span>
      )}
    </div>
  );
};
