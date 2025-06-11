import React from 'react';
import './Loader.scss';
const Loader = ({ className, style }) => (
  <div className={`loader${className ? ` ${className}` : ''}`} style={style}>
    <span>
      <i className="fa fa-spinner fa-spin fa-fw" />
    </span>
  </div>
);

export default Loader;
