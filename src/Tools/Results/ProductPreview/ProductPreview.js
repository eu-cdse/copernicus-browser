import { useState } from 'react';
import { t } from 'ttag';

import './ProductPreview.scss';
import { AttributeNames, AttributeOrbitDirectionValues } from '../../../api/OData/assets/attributes';
import moment from 'moment';

const getTransformationClass = (product) => {
  //previews for SENTINEL-1 are flipped
  if (product?.platformShortName === 'SENTINEL-1') {
    const orbitDirection = product.attributes.find((attr) => attr.Name === AttributeNames.orbitDirection);
    if (orbitDirection?.Value === AttributeOrbitDirectionValues.ASCENDING.value) {
      return 'rotate-flip-horizontal';
    }

    return 'flip-horizontal';
  }

  return null;
};

const shouldShowPreview = ({ previewUrl, product, previewError, validate }) => {
  if (!previewUrl || !product || previewError) {
    return false;
  }

  //show preview when validation is disabled
  if (!validate) {
    return true;
  }

  //temporary disable S2 previews after 2023-10-18 as they are too big (10.000x10.000 instead of 64x64 pixels)
  if (
    product?.platformShortName === 'SENTINEL-2' &&
    moment.utc(product.sensingTime).isAfter(moment.utc('2023-10-18').endOf('day'))
  ) {
    return false;
  }

  return true;
};

const ProductPreview = ({ product = {}, validate = false }) => {
  const { name, previewUrl, className } = product;
  const [previewError, setPreviewError] = useState(false);

  const showPreview = shouldShowPreview({
    previewUrl,
    product,
    previewError,
    validate: validate,
  });

  return (
    <div className={`product-preview ${className ? className : ''}`}>
      {showPreview ? (
        <div className="preview-image">
          <img
            src={previewUrl}
            alt={name}
            onError={() => setPreviewError(true)}
            className={getTransformationClass(product)}
          />
        </div>
      ) : (
        <div className="no-image">{t`No preview available`}</div>
      )}
    </div>
  );
};

export default ProductPreview;
