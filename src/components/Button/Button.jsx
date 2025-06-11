import React from 'react';
import './Button.scss';
import Loader from '../../Loader/Loader';

export const ButtonType = Object.freeze({
  success: 'success',
  danger: 'danger',
  primary: 'primary',
  text: 'text',
});

const Button = ({
  label,
  icon,
  type,
  disabled,
  rounded,
  outlined,
  className,
  iconStyle,
  styleClassName,
  style,
  onClick,
  isLoading,
  isLoadingStyle,
}) => {
  const buttonClass = `copernicus-button ${type}${rounded ? ` rounded` : ''}${outlined ? ` outlined` : ''}${
    className ? ` ${className}` : ''
  }${styleClassName ? ` ${styleClassName}` : ''}${disabled ? ` disabled` : ''}`;

  return (
    <div
      style={isLoadingStyle ? isLoadingStyle : style}
      className={buttonClass}
      onClick={!disabled ? onClick : null}
    >
      {!icon ? (
        <span style={{ visibility: isLoading ? 'hidden' : 'visible' }} className="label">
          {label}
        </span>
      ) : (
        <div style={{ visibility: isLoading ? 'hidden' : 'visible' }} className="icon">
          <i style={iconStyle} className={icon}></i>
        </div>
      )}
      {isLoading && <Loader style={{ position: 'fixed', height: 'auto' }} />}
    </div>
  );
};

Button.defaultProps = {
  type: ButtonType.primary,
  rounded: false,
  outlined: false,
  onClick: () => {},
};

export default Button;
