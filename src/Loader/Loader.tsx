import React, { CSSProperties } from 'react';
import './Loader.scss';

interface LoaderProps {
  className?: string;
  style?: CSSProperties;
}

const Loader: React.FC<LoaderProps> = ({ className, style }) => (
  <div className={`loader${className ? ` ${className}` : ''}`} style={style}>
    <span>
      <i className="fa fa-spinner fa-spin fa-fw" />
    </span>
  </div>
);

export default Loader;
