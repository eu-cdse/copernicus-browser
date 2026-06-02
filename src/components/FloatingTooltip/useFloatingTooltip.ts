import { useRef, useState } from 'react';
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  useRole,
  arrow,
  offset,
  flip,
  shift,
  type Placement,
} from '@floating-ui/react';

type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTION_TO_PLACEMENT: Record<Direction, Placement> = {
  up: 'top',
  down: 'bottom',
  left: 'left',
  right: 'right',
};

interface UseFloatingTooltipOptions {
  direction?: Direction;
  closeOnClickOutside?: boolean;
  defaultPlacement?: Placement;
}

export function useFloatingTooltip({
  direction,
  closeOnClickOutside,
  defaultPlacement = 'top',
}: UseFloatingTooltipOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef<Element>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: (direction !== undefined ? DIRECTION_TO_PLACEMENT[direction] : undefined) ?? defaultPlacement,
    middleware: [offset(8), flip(), shift(), arrow({ element: arrowRef })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { enabled: !!closeOnClickOutside });
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return { refs, floatingStyles, context, getReferenceProps, getFloatingProps, arrowRef, isOpen };
}
