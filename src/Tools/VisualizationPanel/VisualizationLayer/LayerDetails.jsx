import React from 'react';
import ReactMarkdown from 'react-markdown';

import Legend from '../Legend';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../../rehypeConfig';

function isDiscreteLegend(legend) {
  if (!legend) {
    return false;
  }
  if (Array.isArray(legend)) {
    return legend.every((l) => l.type === 'discrete');
  }
  return legend.type === 'discrete';
}

const LayerDetails = ({ viz, legend, detailsOpen, longDescription }) => {
  if (!detailsOpen) {
    return null;
  }

  const discrete = isDiscreteLegend(legend);

  return (
    <div className={`layer-details${discrete ? ' discrete-layout' : ''}`}>
      <Legend legendDefinitionFromLayer={legend} legendUrl={viz.legendUrl} />
      <div className="layer-description">
        <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{longDescription}</ReactMarkdown>
      </div>
    </div>
  );
};
export default LayerDetails;
