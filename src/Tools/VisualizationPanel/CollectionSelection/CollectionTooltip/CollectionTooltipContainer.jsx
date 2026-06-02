import React from 'react';
import { FloatingPortal, FloatingArrow } from '@floating-ui/react';
import { useFloatingTooltip } from '../../../../components/FloatingTooltip/useFloatingTooltip';
import '../../../../components/FloatingTooltip/floatingTooltip.scss';
import './CollectionTooltip.scss';

export default function CollectionTooltipContainer({
  direction,
  children,
  className = '',
  closeOnClickOutside,
}) {
  const { refs, floatingStyles, context, getReferenceProps, getFloatingProps, arrowRef, isOpen } =
    useFloatingTooltip({ direction, closeOnClickOutside, defaultPlacement: 'right' });

  return (
    <div className={`collection-tooltip ${className}`}>
      <div ref={refs.setReference} {...getReferenceProps()} className="collection-tooltip-icon">
        <i className="fa fa-info"></i>
      </div>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="floating-tooltip-content collection-tooltip-popup"
          >
            {children}
            <FloatingArrow ref={arrowRef} context={context} className="floating-tooltip-arrow" />
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
