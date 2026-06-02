import React, { CSSProperties, ReactNode, useCallback, useEffect } from 'react';

import useKeyPressed from '../../hooks/useKeyPressed';

import './Modal.scss';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  animation?: string;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  width?: number | string;
  height?: number | string;
  customStyles?: CSSProperties;
  className?: string;
  onAnimationEnd?: () => void;
  children?: ReactNode;
}

const toCssSize = (value: number | string | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
};

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  closeOnEsc = true,
  showCloseButton = true,
  width,
  height,
  customStyles,
  className,
  onAnimationEnd,
  children,
}) => {
  const handleEscape = useCallback(() => {
    if (visible && closeOnEsc) {
      onClose();
    }
  }, [visible, closeOnEsc, onClose]);
  useKeyPressed('Escape', handleEscape);

  useEffect(() => {
    if (visible && onAnimationEnd) {
      onAnimationEnd();
    }
  }, [visible, onAnimationEnd]);

  if (!visible) {
    return null;
  }

  const dialogStyle: CSSProperties = {
    width: toCssSize(width),
    height: toCssSize(height),
    ...customStyles,
  };

  return (
    <div className={`rodal${className ? ` ${className}` : ''}`}>
      <div className="rodal-mask" onClick={onClose} />
      <div className="rodal-dialog" role="dialog" aria-modal={true} style={dialogStyle}>
        {showCloseButton && (
          <button type="button" aria-label="Close" className="rodal-close" onClick={onClose} />
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
