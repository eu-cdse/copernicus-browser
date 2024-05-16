import React, { useState } from 'react';

const DEFAULT_DELAY = 400;

export const copyValue = (value, cb, delay = DEFAULT_DELAY) => {
  const text = typeof value === 'object' ? JSON.stringify(value) : value;
  navigator.clipboard.writeText(text).then(() => setTimeout(() => cb(false), delay));
  cb(true);
};

const CopyToClipboardButton = ({ className, title, value, delay }) => {
  const [copyConfirmation, setCopyConfirmation] = useState(false);

  return (
    <span
      className={className}
      title={title}
      onClick={() => copyValue(value, (confirmation) => setCopyConfirmation(confirmation), delay)}
    >
      {copyConfirmation ? <i className="fas fa-check-circle" /> : <i className="far fa-copy" />}
    </span>
  );
};

export default CopyToClipboardButton;
