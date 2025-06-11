import React from 'react';
import ReactMarkdown from 'react-markdown';
import CreditsList from '../../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/CreditsList';
import CollectionTooltipContainer from './CollectionTooltipContainer';

const CollectionTooltip = ({ title, source, credits, className }) => {
  if (!(source || (credits && credits.length))) {
    return null;
  }

  return (
    <CollectionTooltipContainer direction="right" closeOnClickOutside={true} className={className}>
      {title && <h2 style={{ margin: '0 0 10px 0' }}>{title}</h2>}
      {source && <ReactMarkdown children={source} linkTarget="_blank" />}
      {credits && credits.length && <CreditsList credits={credits} />}
    </CollectionTooltipContainer>
  );
};

export default CollectionTooltip;
