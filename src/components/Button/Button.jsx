import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = ({ label, className, style, onClick }) => {
  return (
    <div style={style} className={`copernicus-button ${className}`} onClick={onClick}>
      <span className="label">{label}</span>
    </div>
  );
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  className: 'primary',
  onClick: () => {},
};

export default Button;
