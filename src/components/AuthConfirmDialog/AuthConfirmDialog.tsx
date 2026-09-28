import React, { ReactNode, useId } from 'react';

import Modal from '../Modal/Modal';
import Loader from '../../Loader/Loader';

import './AuthConfirmDialog.scss';

interface AuthConfirmDialogProps {
  title?: ReactNode;
  text: ReactNode;
  footer?: ReactNode;
  okLabel: ReactNode;
  cancelLabel: ReactNode;
  onOk: () => void;
  onCancel: () => void;
  okDisabled?: boolean;
  cancelDisabled?: boolean;
  cancelLoading?: boolean;
  centered?: boolean;
  closeOnEsc?: boolean;
  onClose?: () => void;
  className?: string;
}

// Shared two-button auth dialog. Used by the blocking startup flows in ThemesProvider
// (private configuration / CCM access denied), by the initial login dialog shown on first page
// load (EnsureAuth) and by the dismissible feature login prompt.
const AuthConfirmDialog = ({
  title,
  text,
  footer,
  okLabel,
  cancelLabel,
  onOk,
  onCancel,
  okDisabled = false,
  cancelDisabled = false,
  cancelLoading = false,
  centered = false,
  closeOnEsc = false,
  onClose,
  className,
}: AuthConfirmDialogProps) => {
  // Scoped per instance so two mounted dialogs can never point their aria-* attributes at the
  // same node — the ids used to be hard-coded.
  const id = useId();
  const titleId = `${id}-title`;
  const textId = `${id}-text`;

  return (
    <Modal
      animation="slideUp"
      visible={true}
      className={className}
      customStyles={{
        position: 'fixed',
        width: '90%',
        maxWidth: '600px',
        height: 'auto',
        // The initial login dialog is the tallest consumer (title + two paragraphs + consent
        // notice), so cap it rather than let it run off a short viewport.
        maxHeight: '90vh',
        overflowY: 'auto',
        bottom: 'auto',
        // translateY(-50%) pulls the dialog back by half its height, so `top` is where its own
        // midpoint lands: 50% is the middle of the viewport, the 30% default sits above it.
        top: centered ? '50%' : '30%',
        transform: 'translateY(-50%)',
      }}
      onClose={onClose ? onClose : () => {}}
      showCloseButton={false}
      closeOnEsc={closeOnEsc}
    >
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={textId}
      >
        {title && (
          <div id={titleId} className="confirm-dialog__title">
            {title}
          </div>
        )}
        <div id={textId} className="confirm-dialog__text">
          {text}
        </div>
        <div className="confirm-dialog__buttons">
          <button
            className="confirm-dialog__btn confirm-dialog__btn--ok"
            onClick={onOk}
            disabled={okDisabled}
          >
            {okLabel}
          </button>
          <button
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={onCancel}
            disabled={cancelDisabled}
          >
            <span style={{ visibility: cancelLoading ? 'hidden' : 'visible' }}>{cancelLabel}</span>
            {cancelLoading && <Loader />}
          </button>
        </div>
        {footer && <div className="confirm-dialog__footer">{footer}</div>}
      </div>
    </Modal>
  );
};

export default AuthConfirmDialog;
