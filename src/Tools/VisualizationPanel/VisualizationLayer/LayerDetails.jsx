import React from 'react';
import ReactMarkdown from 'react-markdown';

import Legend from '../Legend';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../../rehypeConfig';

const LayerDetails = ({ viz, legend, detailsOpen, longDescription }) => {
  if (!detailsOpen) {
    return null;
  }

  return (
    <div className="layer-details">
      <Legend legendDefinitionFromLayer={legend} legendUrl={viz.legendUrl} />
      <div className="layer-description">
        <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{longDescription}</ReactMarkdown>
      </div>
    </div>
  );
};
export default LayerDetails;
