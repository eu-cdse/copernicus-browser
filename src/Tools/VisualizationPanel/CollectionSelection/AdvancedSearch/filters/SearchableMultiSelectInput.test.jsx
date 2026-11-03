import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock SVG imports — the project's fileTransform.cjs returns a plain string for the
// default export of .svg files, which is not a valid React element type. We replace each
// SVG with a lightweight functional component so the SearchableSelect's dropdown indicator can render.
jest.mock('../../../../../icons/chevron-down.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'chevron-down' }),
  };
});

jest.mock('../../../../../icons/chevron-up.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'chevron-up' }),
  };
});

jest.mock('../../../../../icons/magnifier.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'magnifier' }),
  };
});

import { SearchableMultiSelectInput } from './SearchableMultiSelectInput';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

const buildInput = (overrides = {}) => ({
  id: 'test-filter',
  title: 'Test title',
  tooltip: undefined,
  getOptions: jest.fn(() => options),
  ...overrides,
});

const openMenu = (container) => {
  fireEvent.mouseDown(container.querySelector('[class*="-control"]'));
};

const SearchableMultiSelectHarness = ({ input, initialValue = [], userToken }) => {
  const [value, setValue] = useState(initialValue);
  return <SearchableMultiSelectInput input={input} value={value} onChange={setValue} userToken={userToken} />;
};

describe('SearchableMultiSelectInput', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the title when titleEnabled is true (default)', () => {
    const input = buildInput();
    render(<SearchableMultiSelectInput input={input} value={[]} onChange={jest.fn()} />);

    expect(screen.getByText('Test title')).toBeInTheDocument();
  });

  test('hides the title when titleEnabled is false', () => {
    const input = buildInput();
    render(<SearchableMultiSelectInput input={input} value={[]} onChange={jest.fn()} titleEnabled={false} />);

    expect(screen.queryByText('Test title')).not.toBeInTheDocument();
  });

  test('renders the tooltip icon when input.tooltip is set', () => {
    const input = buildInput({ tooltip: 'Some helpful info' });
    const { container } = render(
      <SearchableMultiSelectInput input={input} value={[]} onChange={jest.fn()} />,
    );

    expect(container.querySelector('.collection-tooltip-icon')).toBeInTheDocument();
  });

  test('does not render the tooltip icon when input.tooltip is not set', () => {
    const input = buildInput({ tooltip: undefined });
    const { container } = render(
      <SearchableMultiSelectInput input={input} value={[]} onChange={jest.fn()} />,
    );

    expect(container.querySelector('.collection-tooltip-icon')).not.toBeInTheDocument();
  });

  test('calls input.getOptions with the userToken to source dropdown options', () => {
    const input = buildInput();
    render(<SearchableMultiSelectInput input={input} value={[]} onChange={jest.fn()} userToken="my-token" />);

    expect(input.getOptions).toHaveBeenCalledWith({ userToken: 'my-token' });
  });

  test('renders the opened menu outside the input, above the tools panel', () => {
    const input = buildInput();
    const { container } = render(
      <SearchableMultiSelectInput input={input} value={[]} onChange={jest.fn()} />,
    );

    openMenu(container);

    const option = screen.getByRole('option', { name: 'Alpha' });
    expect(container).not.toContainElement(option);

    const menuPortal = option.closest('[class*="-menu"]').parentElement;
    expect(menuPortal.parentElement).toBe(document.body);
    expect(menuPortal).toHaveStyle({ zIndex: '9999' });
  });

  test('renders options sourced from input.getOptions when the menu is opened', () => {
    const input = buildInput();
    const { container } = render(
      <SearchableMultiSelectInput input={input} value={[]} onChange={jest.fn()} />,
    );

    openMenu(container);

    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
  });

  test('selecting an option calls onChange with the updated array of selected options', () => {
    const input = buildInput();
    const onChange = jest.fn();
    const { container } = render(<SearchableMultiSelectInput input={input} value={[]} onChange={onChange} />);

    openMenu(container);
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([{ value: 'a', label: 'Alpha' }], expect.any(Object));
  });

  test('selecting a second option appends to the already-selected values', () => {
    const input = buildInput();
    const { container } = render(<SearchableMultiSelectHarness input={input} initialValue={[options[0]]} />);

    openMenu(container);
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }));

    expect(container.querySelectorAll('[class*="-multiValue"]')).toHaveLength(2);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
