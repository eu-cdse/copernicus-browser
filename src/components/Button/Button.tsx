import React, { ReactNode, CSSProperties } from 'react';
import './Button.scss';
import Loader from '../../Loader/Loader';

export const ButtonType = Object.freeze({
  success: 'success',
  danger: 'danger',
  primary: 'primary',
  text: 'text',
});

export type ButtonTypeValue = (typeof ButtonType)[keyof typeof ButtonType];

interface ButtonProps {
  label?: ReactNode;
  icon?: string;
  type?: ButtonTypeValue;
  disabled?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  className?: string;
  iconStyle?: CSSProperties;
  styleClassName?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
  isLoadingStyle?: CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  type = ButtonType.primary,
  disabled = false,
  rounded = false,
  outlined = false,
  className = '',
  iconStyle,
  styleClassName = '',
  style,
  labelStyle,
  onClick = () => {},
  isLoading = false,
  isLoadingStyle,
}) => {
  const buttonClass = `copernicus-button ${type}${rounded ? ` rounded` : ''}${outlined ? ` outlined` : ''}${
    className ? ` ${className}` : ''
  }${styleClassName ? ` ${styleClassName}` : ''}${disabled ? ` disabled` : ''}`;

  return (
    <div
      style={isLoadingStyle ? isLoadingStyle : style}
      className={buttonClass}
      onClick={!disabled ? onClick : undefined}
    >
      {!icon ? (
        <span style={{ visibility: isLoading ? 'hidden' : 'visible', ...labelStyle }} className="label">
          {label}
        </span>
      ) : (
        <div style={{ visibility: isLoading ? 'hidden' : 'visible' }} className="icon">
          <i style={iconStyle} className={icon}></i>
        </div>
      )}
      {isLoading && <Loader />}
    </div>
  );
};

export default Button;
