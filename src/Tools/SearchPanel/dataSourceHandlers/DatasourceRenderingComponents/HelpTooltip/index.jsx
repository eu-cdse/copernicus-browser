import React, { useRef } from 'react';
import Tooltip from 'react-tooltip-lite';
import './HelpTooltip.scss';
import { useOnClickOutside } from '../../../../../hooks/useOnClickOutside';

export default function HelpTooltip(props) {
  const [opened, setOpened] = React.useState(false);
  const ref = useRef();
  useOnClickOutside(ref, (e) => {
    const clickIsInside = Array.from(document.querySelectorAll('[class^="react-tooltip-lite"]')).some(
      (elem) => elem.contains(e.target),
    );
    if (props.closeOnClickOutside && !clickIsInside) {
      setOpened(false);
    }
  });
  return (
    <Tooltip
      isOpen={opened}
      tagName="span"
      direction={props.direction}
      content={props.children}
      className={`help-tooltip ${props.className} ${opened ? 'opened' : 'closed'}`}
    >
      <span ref={ref} onClick={() => setOpened((o) => !o)} className="help-tooltip-icon">
        <i className="fa fa-info-circle" />
      </span>
    </Tooltip>
  );
}
