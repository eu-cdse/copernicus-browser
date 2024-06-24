import React, { useState } from 'react';

import { FolderNode } from './FolderNode';
import { FileNode } from './FileNode';

import './FileTree.scss';

const FileTree = ({ nodes, setNodes, expandedNodes, setExpandedNodes, product, userToken, rootNode }) => {
  const [selected, setSelected] = useState(null);

  const renderNode = (node, isRoot) => {
    const isFolder = node.ChildrenNumber > 0;
    const isExpanded = expandedNodes.includes(node.Nodes.uri);
    const children = nodes[node.Nodes.uri];

    return (
      <div className="node" key={node.Id}>
        {isFolder && (
          <FolderNode
            isExpanded={isExpanded}
            node={node}
            product={product}
            userToken={userToken}
            isRoot={isRoot}
            nodes={nodes}
            setNodes={setNodes}
            setExpandedNodes={setExpandedNodes}
            expandedNodes={expandedNodes}
          />
        )}
        {!isFolder && (
          <FileNode
            node={node}
            selected={selected}
            setSelected={setSelected}
            product={product}
            userToken={userToken}
          />
        )}
        {isFolder && isExpanded && (
          <div className="children">{children.map((childNode) => renderNode(childNode, false))}</div>
        )}
      </div>
    );
  };

  if (!rootNode) {
    return null;
  }

  return <div className="file-tree">{renderNode(rootNode, true)}</div>;
};

export default FileTree;
