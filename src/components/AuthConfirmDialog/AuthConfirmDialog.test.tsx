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

  test('forwards className to the modal root', () => {
    const { container } = render(
      <AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} className="ensure-auth" />,
    );

    expect(container.querySelector('.rodal.ensure-auth')).toBeInTheDocument();
  });

  test('omits the className when none is given', () => {
    const { container } = render(<AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} />);

    expect(container.querySelector('.rodal')).toHaveClass('rodal', { exact: true });
  });

  test('renders the footer only when one is passed', () => {
    const { container, rerender } = render(
      <AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(container.querySelector('.confirm-dialog__footer')).not.toBeInTheDocument();

    rerender(
      <AuthConfirmDialog
        {...baseProps}
        onOk={jest.fn()}
        onCancel={jest.fn()}
        footer={<span>small print</span>}
      />,
    );
    expect(container.querySelector('.confirm-dialog__footer')).toHaveTextContent('small print');
  });

  test('shows a loader in the cancel button and hides its label while cancelLoading', () => {
    render(<AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} cancelLoading={true} />);

    // The label is visibility:hidden while loading, so the button has no accessible name to query by.
    const label = screen.getByText(baseProps.cancelLabel);
    const cancel = label.closest('button');
    expect(label).toHaveStyle({ visibility: 'hidden' });
    expect(cancel?.querySelector('.loader')).toBeInTheDocument();
    expect(cancel?.querySelector('.fa-spinner')).toBeInTheDocument();
  });

  test('shows the cancel label and no loader by default', () => {
    render(<AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} />);

    const cancel = screen.getByRole('button', { name: baseProps.cancelLabel });
    expect(cancel.querySelector('.loader')).not.toBeInTheDocument();
    expect(screen.getByText(baseProps.cancelLabel)).toHaveStyle({ visibility: 'visible' });
  });

  test('cancelDisabled prevents onCancel from firing', () => {
    const onCancel = jest.fn();
    render(<AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={onCancel} cancelDisabled={true} />);

    const cancel = screen.getByRole('button', { name: baseProps.cancelLabel });
    expect(cancel).toBeDisabled();
    fireEvent.click(cancel);
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('okDisabled prevents onOk from firing', () => {
    const onOk = jest.fn();
    render(<AuthConfirmDialog {...baseProps} onOk={onOk} onCancel={jest.fn()} okDisabled={true} />);

    const ok = screen.getByRole('button', { name: baseProps.okLabel });
    expect(ok).toBeDisabled();
    fireEvent.click(ok);
    expect(onOk).not.toHaveBeenCalled();
  });

  test('wires aria-labelledby and aria-describedby to nodes that exist', () => {
    render(<AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} />);

    // An alertdialog takes its name and description only from aria-labelledby / aria-describedby,
    // so these resolve only if both ids point at the rendered title and text nodes.
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAccessibleName(baseProps.title);
    expect(dialog).toHaveAccessibleDescription(baseProps.text);
  });

  test('drops aria-labelledby and the heading when no title is given', () => {
    const { container } = render(
      <AuthConfirmDialog {...baseProps} title={undefined} onOk={jest.fn()} onCancel={jest.fn()} />,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(container.querySelector('.confirm-dialog__title')).not.toBeInTheDocument();
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  test('sits in the viewport upper third by default and in the middle when centered', () => {
    const { container, rerender } = render(
      <AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(container.querySelector('.rodal-dialog')).toHaveStyle({ top: '30%' });

    rerender(<AuthConfirmDialog {...baseProps} onOk={jest.fn()} onCancel={jest.fn()} centered={true} />);
    expect(container.querySelector('.rodal-dialog')).toHaveStyle({ top: '50%' });
  });

  test('two mounted dialogs do not share ARIA ids', () => {
    const { container } = render(
      <>
        <AuthConfirmDialog {...baseProps} title="First" onOk={jest.fn()} onCancel={jest.fn()} />
        <AuthConfirmDialog {...baseProps} title="Second" onOk={jest.fn()} onCancel={jest.fn()} />
      </>,
    );

    const [first, second] = container.querySelectorAll('.confirm-dialog');
    expect(first.getAttribute('aria-labelledby')).not.toBe(second.getAttribute('aria-labelledby'));
    expect(first.getAttribute('aria-describedby')).not.toBe(second.getAttribute('aria-describedby'));
  });
});
