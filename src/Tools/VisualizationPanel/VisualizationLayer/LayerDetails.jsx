import React from 'react';
import ReactMarkdown from 'react-markdown';

import ExternalLink from '../../../ExternalLink/ExternalLink';
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
        <ReactMarkdown
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          children={longDescription}
          linkTarget="_blank"
          components={{
            link: (props) => <ExternalLink href={props.href}>{props.children}</ExternalLink>,
          }}
        />
      </div>
    </div>
  );
};
export default LayerDetails;
