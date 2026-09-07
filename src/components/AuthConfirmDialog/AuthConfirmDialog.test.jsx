import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import AuthConfirmDialog from './AuthConfirmDialog';

const baseProps = {
  title: 'Authentication Required',
  text: 'You need to be logged in to download products. Please log in to continue.',
  okLabel: 'Log in',
  cancelLabel: 'Continue without logging in',
};

describe('AuthConfirmDialog', () => {
  test('renders the title, text and both button labels', () => {
    render(<AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText(baseProps.title)).toBeInTheDocument();
    expect(screen.getByText(baseProps.text)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: baseProps.okLabel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: baseProps.cancelLabel })).toBeInTheDocument();
  });

  test('calls onOk when the confirm button is clicked', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    render(<AuthConfirmDialog {...baseProps} onOk={onOk} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: baseProps.okLabel }));

    expect(onOk).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('calls onCancel when the cancel button is clicked', () => {
    const onOk = jest.fn();
    const onCancel = jest.fn();
    render(<AuthConfirmDialog {...baseProps} onOk={onOk} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: baseProps.cancelLabel }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOk).not.toHaveBeenCalled();
  });

  test('does not render a close button and ignores Escape by default', () => {
    const onClose = jest.fn();
    const { container } = render(
      <AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} onClose={onClose} />,
    );

    expect(container.querySelector('.rodal-close')).not.toBeInTheDocument();

    fireEvent.keyUp(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  test('closes on Escape when closeOnEsc is enabled', () => {
    const onClose = jest.fn();
    render(
      <AuthConfirmDialog
        {...baseProps}
        onOk={jest.fn()}
        onCancel={jest.fn()}
        onClose={onClose}
        closeOnEsc={true}
      />,
    );

    fireEvent.keyUp(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
