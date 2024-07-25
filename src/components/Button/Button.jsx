import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

const Button = ({ label, className, styleClassName, style, onClick }) => {
  return (
    <div style={style} className={`copernicus-button ${className} ${styleClassName}`} onClick={onClick}>
      <span className="label">{label}</span>
    </div>
  );
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  styleClassName: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  className: 'primary',
  onClick: () => {},
};

export default Button;
