import React from 'react';
import ReactMarkdown from 'react-markdown';
import CreditsList from '../../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/CreditsList';
import CollectionTooltipContainer from './CollectionTooltipContainer';

const CollectionTooltip = ({ source, credits, className }) => {
  if (!(source || (credits && credits.length))) {
    return null;
  }

  return (
    <CollectionTooltipContainer direction="right" closeOnClickOutside={true} className={className}>
      {source && <ReactMarkdown children={source} linkTarget="_blank" />}
      {credits && credits.length && <CreditsList credits={credits} />}
    </CollectionTooltipContainer>
  );
};

export default CollectionTooltip;
