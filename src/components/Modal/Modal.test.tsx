import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import Modal from './Modal';

describe('Modal', () => {
  describe('rendering via portal', () => {
    it('renders children into document.body when visible=true', () => {
      render(
        <Modal visible={true} onClose={jest.fn()}>
          <span>modal content</span>
        </Modal>,
      );

      expect(document.body.querySelector('.rodal')).toBeInTheDocument();
      expect(document.body).toHaveTextContent('modal content');
    });

    it('does not render children when visible=false', () => {
      render(
        <Modal visible={false} onClose={jest.fn()}>
          <span>modal content</span>
        </Modal>,
      );

      expect(document.body.querySelector('.rodal')).not.toBeInTheDocument();
      expect(document.body).not.toHaveTextContent('modal content');
    });
  });

  describe('Escape key handling', () => {
    it('calls onClose when Escape is pressed and closeOnEsc=true (default)', () => {
      const onClose = jest.fn();
      render(
        <Modal visible={true} onClose={onClose}>
          content
        </Modal>,
      );

      fireEvent.keyUp(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape is pressed and closeOnEsc=false', () => {
      const onClose = jest.fn();
      render(
        <Modal visible={true} onClose={onClose} closeOnEsc={false}>
          content
        </Modal>,
      );

      fireEvent.keyUp(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when Escape is pressed and visible=false', () => {
      const onClose = jest.fn();
      render(
        <Modal visible={false} onClose={onClose}>
          content
        </Modal>,
      );

      fireEvent.keyUp(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('backdrop click', () => {
    it('calls onClose when the .rodal-mask is clicked', () => {
      const onClose = jest.fn();
      render(
        <Modal visible={true} onClose={onClose}>
          content
        </Modal>,
      );

      const mask = document.body.querySelector('.rodal-mask') as HTMLElement;
      fireEvent.click(mask);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('close button', () => {
    it('renders the .rodal-close button by default', () => {
      render(
        <Modal visible={true} onClose={jest.fn()}>
          content
        </Modal>,
      );

      expect(document.body.querySelector('.rodal-close')).toBeInTheDocument();
    });

    it('does not render the .rodal-close button when showCloseButton=false', () => {
      render(
        <Modal visible={true} onClose={jest.fn()} showCloseButton={false}>
          content
        </Modal>,
      );

      expect(document.body.querySelector('.rodal-close')).not.toBeInTheDocument();
    });

    it('calls onClose when .rodal-close is clicked', () => {
      const onClose = jest.fn();
      render(
        <Modal visible={true} onClose={onClose}>
          content
        </Modal>,
      );

      const closeBtn = document.body.querySelector('.rodal-close') as HTMLElement;
      fireEvent.click(closeBtn);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('width and height props', () => {
    it('applies numeric width and height as pixel values on .rodal-dialog', () => {
      render(
        <Modal visible={true} onClose={jest.fn()} width={640} height={480}>
          content
        </Modal>,
      );

      const dialog = document.body.querySelector('.rodal-dialog') as HTMLElement;
      expect(dialog.style.width).toBe('640px');
      expect(dialog.style.height).toBe('480px');
    });
  });

  describe('customStyles prop', () => {
    it('applies customStyles to .rodal-dialog', () => {
      render(
        <Modal visible={true} onClose={jest.fn()} customStyles={{ background: 'red', padding: '20px' }}>
          content
        </Modal>,
      );

      const dialog = document.body.querySelector('.rodal-dialog') as HTMLElement;
      expect(dialog.style.background).toBe('red');
      expect(dialog.style.padding).toBe('20px');
    });
  });

  describe('className prop', () => {
    it('applies the className prop to the .rodal root element', () => {
      render(
        <Modal visible={true} onClose={jest.fn()} className="my-custom-modal">
          content
        </Modal>,
      );

      const root = document.body.querySelector('.rodal') as HTMLElement;
      expect(root).toHaveClass('rodal');
      expect(root).toHaveClass('my-custom-modal');
    });
  });

  describe('onAnimationEnd callback', () => {
    it('calls onAnimationEnd after the enter animation completes', async () => {
      const onAnimationEnd = jest.fn();
      const { rerender } = render(
        <Modal visible={false} onClose={jest.fn()} onAnimationEnd={onAnimationEnd}>
          content
        </Modal>,
      );

      // Trigger the enter transition by switching visible from false to true
      rerender(
        <Modal visible={true} onClose={jest.fn()} onAnimationEnd={onAnimationEnd}>
          content
        </Modal>,
      );

      await waitFor(
        () => {
          expect(onAnimationEnd).toHaveBeenCalledTimes(1);
        },
        { timeout: 1000 },
      );
    });
  });
});
