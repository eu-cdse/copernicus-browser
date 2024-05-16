import React, { useEffect, useRef } from 'react';
import './ProgressBar.scss';

export const ProgressBar = ({ value = 0, displayLabel = true, onCancel = null }) => {
  const progressRef = useRef(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${value}%`;
    }
  }, [value]);

  return (
    <div className={`progress-bar`}>
      <div className={`pb-container`}>
        <div className="pb-bar" ref={progressRef} />
      </div>
      {displayLabel && value !== undefined && value !== null && (
        <div className={`pb-label`}>{`${value}%`} </div>
      )}
      {onCancel && <i className="fa fa-times-circle" onClick={onCancel}></i>}
    </div>
  );
};

export default ProgressBar;
