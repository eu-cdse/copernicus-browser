import React from 'react';
import ReactMarkdown from 'react-markdown';
import CreditsList from './CreditsList';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../../../../rehypeConfig';

const DataSourceTooltip = ({ source, credits }) => {
  return (
    <div className="data-source-group-tooltip">
      <div className="tooltip-description">
        <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{source}</ReactMarkdown>
      </div>
      <CreditsList credits={credits} />
    </div>
  );
};

export default DataSourceTooltip;
