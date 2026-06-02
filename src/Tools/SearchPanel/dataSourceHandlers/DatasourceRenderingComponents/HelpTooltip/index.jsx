import React from 'react';
import { FloatingPortal, FloatingArrow } from '@floating-ui/react';
import { useFloatingTooltip } from '../../../../../components/FloatingTooltip/useFloatingTooltip';
import '../../../../../components/FloatingTooltip/floatingTooltip.scss';
import './HelpTooltip.scss';

export default function HelpTooltip({ direction, children, className = '', closeOnClickOutside }) {
  const { refs, floatingStyles, context, getReferenceProps, getFloatingProps, arrowRef, isOpen } =
    useFloatingTooltip({ direction, closeOnClickOutside, defaultPlacement: 'top' });

  return (
    <span className={`help-tooltip ${className}`}>
      <span ref={refs.setReference} {...getReferenceProps()} className="help-tooltip-icon">
        <i className="fa fa-info-circle" />
      </span>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="floating-tooltip-content"
          >
            {children}
            <FloatingArrow ref={arrowRef} context={context} className="floating-tooltip-arrow" />
          </div>
        </FloatingPortal>
      )}
    </span>
  );
}
