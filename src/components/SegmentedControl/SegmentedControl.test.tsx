import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('SegmentedControl', () => {
  it('renders a tab for each option', () => {
    render(<SegmentedControl options={OPTIONS} value="a" onChange={jest.fn()} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('marks the option matching value as selected', () => {
    render(<SegmentedControl options={OPTIONS} value="b" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Option A' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Option B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Option C' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the clicked option value', () => {
    const onChange = jest.fn();
    render(<SegmentedControl options={OPTIONS} value="a" onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Option C' }));

    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('disables all options when disabled=true', () => {
    render(<SegmentedControl options={OPTIONS} value="a" onChange={jest.fn()} disabled />);

    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab).toBeDisabled();
    });
  });
});
