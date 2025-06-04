import React from 'react';
import ReactMarkdown from 'react-markdown';
import CreditsList from './CreditsList';

const DataSourceTooltip = ({ source, credits }) => {
  return (
    <div className="data-source-group-tooltip">
      <div className="tooltip-description">
        <ReactMarkdown children={source} linkTarget="_blank" />
      </div>
      <CreditsList credits={credits} />
    </div>
  );
};

export default DataSourceTooltip;
