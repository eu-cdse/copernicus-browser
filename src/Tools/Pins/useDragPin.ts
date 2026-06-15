import { useCallback, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DragItem {
  id: string;
  index: number;
}

interface UseDragPinProps {
  id: string;
  index: number;
  itemType: string;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

export const useDragPin = ({ id, index, itemType, moveItem }: UseDragPinProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [canDrag, setCanDrag] = useState(true);

  const ref = useRef<HTMLElement>(null);

  const [, drop] = useDrop<DragItem>({
    accept: itemType,
    hover(draggableItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggableItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return;
      }

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      draggableItem.index = hoverIndex;
    },
  });

  const [, drag, previewRef] = useDrag<DragItem>({
    type: itemType,
    item: () => {
      setIsDragging(true);
      return { id, index };
    },
    canDrag: () => canDrag,
    end: () => {
      setIsDragging(false);
    },
  });

  drop(ref);
  drag(ref);

  const shouldDrag = useCallback((state: boolean) => {
    setCanDrag(state);
  }, []);

  return { isDragging, previewRef, ref, shouldDrag };
};
