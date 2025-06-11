import React from 'react';
import './Tag.scss';

export const TagType = Object.freeze({
  success: 'success',
  danger: 'danger',
  primary: 'primary',
  light: 'light',
});

const Tag = ({ id, reference, label, type, style }) => {
  return reference ? (
    <div ref={(el) => (reference.current[id] = el)} className={`tag ${type}`} style={style}>
      {label}
    </div>
  ) : (
    <div className={`tag ${type}`} style={style}>
      {label}
    </div>
  );
};

Tag.defaultProps = {
  type: TagType.primary,
  onClick: () => {},
};

export default Tag;
