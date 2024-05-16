import { ODataEndpoints } from '../../../api/OData/ODataApi';
import { ODataQueryBuilder } from '../../../api/OData/ODataQueryBuilder';
import { ODataEntity } from '../../../api/OData/ODataTypes';
import CopyToClipboardButton from '../../../components/CopyToClipboardButton/CopyToClipboardButton';

const ProductLink = ({ product }) => {
  const downloadProductUrl = `${ODataEndpoints.download}${new ODataQueryBuilder(ODataEntity.Products)
    .value(product.id)
    .getQueryString()}`;

  return (
    <div className={`product-link`}>
      <label>Product id:</label>
      <div>{downloadProductUrl}</div>
      <CopyToClipboardButton value={downloadProductUrl} title="Copy to clipboard" />
    </div>
  );
};

export default ProductLink;
