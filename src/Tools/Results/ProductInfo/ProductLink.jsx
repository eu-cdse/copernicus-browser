import React from 'react';
import { ODataEndpoints } from '../../../api/OData/ODataApi';
import { ODataQueryBuilder } from '../../../api/OData/ODataQueryBuilder';
import { ODataEntity } from '../../../api/OData/ODataTypes';
import CopyToClipboardButton from '../../../components/CopyToClipboardButton/CopyToClipboardButton';
import DataSourceTooltip from '../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/DataSourceTooltip';
import { t } from 'ttag';
import HelpTooltip from '../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';

const ProductIdMarkdown = () => t`
For downloading products you need an authorization token. Learn more [here](https://documentation.dataspace.copernicus.eu/APIs/OData.html#product-download).
`;

export const ProductIdTooltipDescription = () => {
  const tooltipData = DataSourceTooltip({
    source: ProductIdMarkdown(),
  });
  return (
    <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft product-tooltip">
      {tooltipData}
    </HelpTooltip>
  );
};

const ProductLink = ({ product }) => {
  const downloadProductUrl = `${ODataEndpoints.download}${new ODataQueryBuilder(ODataEntity.Products)
    .value(product.id)
    .getQueryString()}`;

  return (
    <div className="product-link">
      <div className="product-link-title">
        <label>Download link with product id</label>
        <ProductIdTooltipDescription />
      </div>
      <div className="product-link-content">
        <div className="product-link-url">{downloadProductUrl}</div>
        <CopyToClipboardButton value={downloadProductUrl} title="Copy to clipboard" />
      </div>
    </div>
  );
};

export default ProductLink;
