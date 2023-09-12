import React, { useState } from 'react';
import { t } from 'ttag';

export const copyGeometry = (geometry, cb) => {
  let textField = document.createElement('textarea');
  textField.innerText = JSON.stringify(geometry);
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
  cb(true);
  setTimeout(() => cb(false), 400);
};

const CopyGeometryToClipboardButton = ({ geometry }) => {
  const [copyGeometryConfirmation, setCopyGeometryConfirmation] = useState(false);

  return (
    <span
      className={`copy-coord`}
      title={t`Copy geometry to clipboard`}
      onClick={() => copyGeometry(geometry, (confirmation) => setCopyGeometryConfirmation(confirmation))}
    >
      {copyGeometryConfirmation ? <i className="fas fa-check-circle" /> : <i className="far fa-copy" />}
    </span>
  );
};

export default CopyGeometryToClipboardButton;
