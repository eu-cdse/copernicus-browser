import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HelpTooltip from './index';

describe('HelpTooltip', () => {
  test('renders without crashing', () => {
    const { container } = render(<HelpTooltip>Tooltip content</HelpTooltip>);
    expect(container.querySelector('.help-tooltip')).toBeInTheDocument();
    expect(container.querySelector('.help-tooltip-icon')).toBeInTheDocument();
    expect(container.querySelector('.fa.fa-info-circle')).toBeInTheDocument();
  });

  test('tooltip content is not visible initially', () => {
    render(<HelpTooltip>Tooltip content</HelpTooltip>);
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });

  test('clicking the icon shows the tooltip content', async () => {
    const { container } = render(<HelpTooltip>Tooltip content</HelpTooltip>);
    const icon = container.querySelector('.help-tooltip-icon')!;

    fireEvent.click(icon);

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });
  });

  test('clicking the icon again hides the tooltip content', async () => {
    const { container } = render(<HelpTooltip>Tooltip content</HelpTooltip>);
    const icon = container.querySelector('.help-tooltip-icon')!;

    fireEvent.click(icon);
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    fireEvent.click(icon);
    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  test('applies custom className to the wrapper', () => {
    const { container } = render(<HelpTooltip className="my-custom-class">Content</HelpTooltip>);
    expect(container.querySelector('.help-tooltip.my-custom-class')).toBeInTheDocument();
  });

  test('applies default className when none is provided', () => {
    const { container } = render(<HelpTooltip>Content</HelpTooltip>);
    expect(container.querySelector('.help-tooltip')).toBeInTheDocument();
  });

  test('renders children content inside tooltip', async () => {
    const { container } = render(
      <HelpTooltip>
        <span data-testid="child-content">Hello from child</span>
      </HelpTooltip>,
    );
    const icon = container.querySelector('.help-tooltip-icon')!;
    fireEvent.click(icon);

    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  test('closeOnClickOutside: tooltip closes when clicking outside and prop is true', async () => {
    const { container } = render(
      <div>
        <HelpTooltip closeOnClickOutside={true}>Tooltip content</HelpTooltip>
        <button data-testid="outside-button">Outside</button>
      </div>,
    );
    const icon = container.querySelector('.help-tooltip-icon')!;

    fireEvent.click(icon);
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    // @floating-ui/react useDismiss uses pointerdown to detect outside clicks
    fireEvent.pointerDown(screen.getByTestId('outside-button'));

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  test('closeOnClickOutside: tooltip stays open when clicking outside and prop is false', async () => {
    const { container } = render(
      <div>
        <HelpTooltip closeOnClickOutside={false}>Tooltip content</HelpTooltip>
        <button data-testid="outside-button">Outside</button>
      </div>,
    );
    const icon = container.querySelector('.help-tooltip-icon')!;

    fireEvent.click(icon);
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByTestId('outside-button'));

    // tooltip should remain open because closeOnClickOutside is false
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
  });

  test('renders with direction prop without crashing', () => {
    const { container } = render(<HelpTooltip direction="down">Content</HelpTooltip>);
    expect(container.querySelector('.help-tooltip')).toBeInTheDocument();
  });
});
