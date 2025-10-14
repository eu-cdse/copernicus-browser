import React, { useRef, useState } from 'react';
import Tooltip from 'react-tooltip-lite';

import './CollectionTooltip.scss';
import { useOnClickOutside } from '../../../../hooks/useOnClickOutside';

export default function CollectionTooltipContainer(props) {
  const [isOpened, setIsOpened] = useState(false);
  const ref = useRef();
  useOnClickOutside(ref, (e) => {
    const tooltipClassName = 'react-tooltip-lite';
    const clickIsInside = Array.from(document.querySelectorAll(`[class^="${tooltipClassName}"]`)).some(
      (elem) => elem.contains(e.target),
    );
    if (props.closeOnClickOutside && !clickIsInside) {
      setIsOpened(false);
    }
  });
  const { direction, children, className } = props;
  return (
    <Tooltip
      isOpen={isOpened}
      tagName="div"
      direction={direction}
      content={children}
      className={`collection-tooltip ${className} ${isOpened ? 'opened' : 'closed'}`}
    >
      <div ref={ref} onClick={() => setIsOpened((o) => !o)} className="collection-tooltip-icon">
        <i className="fa fa-info"></i>
      </div>
    </Tooltip>
  );
}
