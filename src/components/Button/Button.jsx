import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

export const ButtonType = Object.freeze({
  success: 'success',
  danger: 'danger',
  primary: 'primary',
});

const Button = ({ label, icon, type, rounded, className, styleClassName, style, onClick }) => {
  const buttonClass = `copernicus-button ${type}${rounded ? ` rounded` : ''}${
    className ? ` ${className}` : ''
  }${styleClassName ? ` ${styleClassName}` : ''}`;

  return (
    <div style={style} className={buttonClass} onClick={onClick}>
      {!icon ? (
        <span className="label">{label}</span>
      ) : (
        <div className="icon">
          <i className={icon}></i>
        </div>
      )}
    </div>
  );
};

Button.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string.isRequired,
  rounded: PropTypes.bool,
  className: PropTypes.string,
  styleClassName: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  type: ButtonType.primary,
  rounded: false,
  onClick: () => {},
};

export default Button;
