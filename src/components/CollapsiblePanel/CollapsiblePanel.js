import React from 'react';
import './CollapsiblePanel.scss';

const CollapsiblePanel = ({
  title,
  headerComponent,
  className,
  expanded,
  toggleExpanded,
  disabled,
  children,
  backgroundImg,
}) => {
  return (
    <div className={`collapsible-panel ${className}`}>
      {backgroundImg && expanded && (
        <img className="background-image" alt="Background img" src={backgroundImg} />
      )}
      <div className={`title ${expanded ? 'expanded ' : ' '} ${disabled ? 'disabled' : ''}`}>
        <div className={'title-content'}>{expanded ? headerComponent : title}</div>
        <div className="title-arrow-wrapper" onClick={!disabled ? () => toggleExpanded(!expanded) : null}>
          {expanded ? <i className="fa fa-chevron-up" /> : <i className="fa fa-chevron-down" />}
        </div>
      </div>
      <div className={`content`}>{children(expanded)}</div>
    </div>
  );
};

export default CollapsiblePanel;
