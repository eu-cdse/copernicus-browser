import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CollectionTooltipContainer from './CollectionTooltipContainer';

describe('CollectionTooltipContainer', () => {
  test('renders without crashing', () => {
    const { container } = render(<CollectionTooltipContainer>Tooltip content</CollectionTooltipContainer>);
    expect(container.querySelector('.collection-tooltip')).toBeInTheDocument();
    expect(container.querySelector('.collection-tooltip-icon')).toBeInTheDocument();
    expect(container.querySelector('.fa.fa-info')).toBeInTheDocument();
  });

  test('tooltip content is not visible initially', () => {
    render(<CollectionTooltipContainer>Tooltip content</CollectionTooltipContainer>);
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });

  test('clicking the icon shows the tooltip content', async () => {
    const { container } = render(<CollectionTooltipContainer>Tooltip content</CollectionTooltipContainer>);
    const icon = container.querySelector('.collection-tooltip-icon')!;

    fireEvent.click(icon);

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });
  });

  test('clicking the icon again hides the tooltip content', async () => {
    const { container } = render(<CollectionTooltipContainer>Tooltip content</CollectionTooltipContainer>);
    const icon = container.querySelector('.collection-tooltip-icon')!;

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
    const { container } = render(
      <CollectionTooltipContainer className="my-custom-class">Content</CollectionTooltipContainer>,
    );
    expect(container.querySelector('.collection-tooltip.my-custom-class')).toBeInTheDocument();
  });

  test('applies default className when none is provided', () => {
    const { container } = render(<CollectionTooltipContainer>Content</CollectionTooltipContainer>);
    expect(container.querySelector('.collection-tooltip')).toBeInTheDocument();
  });

  test('renders children content inside tooltip', async () => {
    const { container } = render(
      <CollectionTooltipContainer>
        <span data-testid="child-content">Hello from child</span>
      </CollectionTooltipContainer>,
    );
    const icon = container.querySelector('.collection-tooltip-icon')!;
    fireEvent.click(icon);

    await waitFor(() => {
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  test('closeOnClickOutside: tooltip closes when clicking outside and prop is true', async () => {
    const { container } = render(
      <div>
        <CollectionTooltipContainer closeOnClickOutside={true}>Tooltip content</CollectionTooltipContainer>
        <button data-testid="outside-button">Outside</button>
      </div>,
    );
    const icon = container.querySelector('.collection-tooltip-icon')!;

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
        <CollectionTooltipContainer closeOnClickOutside={false}>Tooltip content</CollectionTooltipContainer>
        <button data-testid="outside-button">Outside</button>
      </div>,
    );
    const icon = container.querySelector('.collection-tooltip-icon')!;

    fireEvent.click(icon);
    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByTestId('outside-button'));

    // tooltip should remain open because closeOnClickOutside is false
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
  });

  test('renders with direction prop without crashing', () => {
    const { container } = render(
      <CollectionTooltipContainer direction="left">Content</CollectionTooltipContainer>,
    );
    expect(container.querySelector('.collection-tooltip')).toBeInTheDocument();
  });

  test('tooltip popup has correct CSS classes when open', async () => {
    const { container } = render(<CollectionTooltipContainer>Content</CollectionTooltipContainer>);
    const icon = container.querySelector('.collection-tooltip-icon')!;
    fireEvent.click(icon);

    await waitFor(() => {
      expect(
        document.querySelector('.floating-tooltip-content.collection-tooltip-popup'),
      ).toBeInTheDocument();
    });
  });
});
