import { useState } from 'react';
import { t } from 'ttag';

import './ProductPreview.scss';

const ProductPreview = ({ name, previewUrl, className }) => {
  const [previewError, setPreviewError] = useState(false);

  return (
    <div className={`product-preview ${className ? className : ''}`}>
      {previewUrl && !previewError ? (
        <div className="preview-image">
          <img src={previewUrl} alt={name} onError={() => setPreviewError(true)} />
        </div>
      ) : (
        <div className="no-image">{t`No preview available`}</div>
      )}
    </div>
  );
};

export default ProductPreview;
