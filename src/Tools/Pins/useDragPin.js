import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

export const useDragPin = ({ id, index, itemType, moveItem }) => {
  const [isDragging, setIsDragging] = useState(false);

  const ref = useRef(null);

  const [, drop] = useDrop({
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
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

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

  const [, drag, previewRef] = useDrag({
    item: { type: itemType, id: id, index },
    begin: () => {
      setIsDragging(true);
    },
    end: () => {
      setIsDragging(false);
    },
  });

  drag(drop(ref));

  return { isDragging, previewRef, ref };
};
