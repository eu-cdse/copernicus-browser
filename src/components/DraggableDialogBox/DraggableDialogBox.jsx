import React, { useCallback, useEffect, useRef, useState } from 'react';

import './DraggableDialogBox.scss';

import DialogBox from './DialogBox';

export const DraggableDialogBox = ({ className, width, height, onClose, title, children, modal = true }) => {
  const [position, setPosition] = useState({
    x: (window.innerWidth - width) / 2,
    y: (window.innerHeight - height) / 2,
  });

  const [padding] = useState({
    x: (window.innerWidth - width) / 2 / window.innerWidth,
    y: (window.innerHeight - height) / 2 / window.innerHeight,
  });

  const [oldWindowSize, setOldWindowSize] = useState({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  });
  const ref = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleWindowResize = () => {
      const element = ref.current;
      if (element) {
        const dx = window.innerWidth - oldWindowSize.innerWidth || 0;
        const dy = window.innerHeight - oldWindowSize.innerHeight || 0;

        let newX = position.x + dx;
        if (window.innerWidth < window.innerWidth * padding.x + width || newX < 0) {
          newX = 0;
        }

        let newY = position.y + dy;
        if (window.innerHeight < window.innerHeight * padding.y + height || newY < 0) {
          newY = 0;
        }

        setPosition({
          x: newX,
          y: newY,
        });

        setOldWindowSize({
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        });
      }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [oldWindowSize, position, width, height, padding]);

  const onDrag = useCallback(
    (event) => {
      if (dragging) {
        const newX = event.clientX - offset.x;
        const newY = event.clientY - offset.y;
        setPosition({
          x: newX,
          y: newY,
        });
      }
    },
    [dragging, offset],
  );

  useEffect(() => {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onStopDragging);

    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onStopDragging);
    };
  }, [onDrag]);

  const onStopDragging = () => {
    setDragging(false);
  };

  const onStartDragging = (event) => {
    setDragging(true);
    setOffset({ x: event.clientX - position.x, y: event.clientY - position.y });
  };

  const getModalMask = () => (modal ? <div className="draggable-dialog-box-mask"></div> : null);

  return (
    <>
      {getModalMask()}
      <div
        ref={ref}
        className={`draggable-dialog-box ${dragging ? 'dragging' : ''}`}
        style={{
          top: position.y,
          left: position.x,
          width: width,
          height: height,
        }}
      >
        <DialogBox
          className={className}
          title={title}
          onClose={onClose}
          onMouseDown={onStartDragging}
          modal={modal}
        >
          {children}
        </DialogBox>
      </div>
    </>
  );
};
