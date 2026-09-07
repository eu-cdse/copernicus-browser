import React from 'react';

import Modal from '../Modal/Modal';

import './AuthConfirmDialog.scss';

// Shared two-button auth dialog. Used both by the blocking startup flows in ThemesProvider
// (private configuration / CCM access denied) and by the dismissible feature login prompt.
const AuthConfirmDialog = ({
  title,
  text,
  okLabel,
  cancelLabel,
  onOk,
  onCancel,
  closeOnEsc = false,
  onClose,
}) => (
  <Modal
    animation="slideUp"
    visible={true}
    customStyles={{
      position: 'fixed',
      width: '90%',
      maxWidth: '600px',
      height: 'auto',
      bottom: 'auto',
      top: '30%',
      transform: 'translateY(-50%)',
    }}
    onClose={onClose ? onClose : () => {}}
    showCloseButton={false}
    closeOnEsc={closeOnEsc}
  >
    <div
      className="confirm-dialog"
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-text"
    >
      <div id="confirm-dialog-title" className="confirm-dialog__title">
        {title}
      </div>
      <div id="confirm-dialog-text" className="confirm-dialog__text">
        {text}
      </div>
      <div className="confirm-dialog__buttons">
        <button className="confirm-dialog__btn confirm-dialog__btn--ok" onClick={onOk}>
          {okLabel}
        </button>
        <button className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default AuthConfirmDialog;
