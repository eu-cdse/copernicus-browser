import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock SVG imports — the project's fileTransform.cjs returns a plain string for the
// default export of .svg files, which is not a valid React element type. We replace each
// SVG with a lightweight functional component so the underlying CustomDropdownIndicator can render.
jest.mock('../../icons/chevron-down.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'chevron-down' }),
  };
});

jest.mock('../../icons/chevron-up.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'chevron-up' }),
  };
});

jest.mock('../../icons/magnifier.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'magnifier' }),
  };
});

import { SearchableSelect } from './SearchableSelect';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

const openMenu = (container) => {
  fireEvent.mouseDown(container.querySelector('[class*="-control"]'));
};

const MultiSelectHarness = ({ initialValue = [] }) => {
  const [value, setValue] = useState(initialValue);
  return <SearchableSelect isMulti options={options} value={value} onChange={setValue} />;
};

describe('SearchableSelect', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders all provided options when the menu is opened', () => {
    const { container } = render(<SearchableSelect options={options} value={null} onChange={jest.fn()} />);

    openMenu(container);

    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gamma' })).toBeInTheDocument();
  });

  test('selecting an option in single-select mode calls onChange with the selected option', () => {
    const onChange = jest.fn();
    const { container } = render(<SearchableSelect options={options} value={null} onChange={onChange} />);

    openMenu(container);
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ value: 'b', label: 'Beta' }, expect.any(Object));
  });

  test('displays the currently selected value in single-select mode', () => {
    const { container } = render(
      <SearchableSelect options={options} value={{ value: 'a', label: 'Alpha' }} onChange={jest.fn()} />,
    );

    expect(container.querySelector('[class*="-singleValue"]')).toHaveTextContent('Alpha');
  });

  test('defaults to single-select mode (isMulti not passed)', () => {
    const { container } = render(<SearchableSelect options={options} value={null} onChange={jest.fn()} />);

    openMenu(container);

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'false');
  });

  test('multi-select mode allows selecting multiple options and calls onChange with an array', () => {
    const { container } = render(<MultiSelectHarness />);

    openMenu(container);
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }));

    openMenu(container);
    fireEvent.click(screen.getByRole('option', { name: 'Gamma' }));

    expect(container.querySelectorAll('[class*="-multiValue"]')).toHaveLength(2);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  test('isMulti renders selected options as a multiselectable listbox', () => {
    const { container } = render(
      <SearchableSelect
        isMulti
        options={options}
        value={[{ value: 'a', label: 'Alpha' }]}
        onChange={jest.fn()}
      />,
    );

    openMenu(container);

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });

  test('spreads additional props (e.g. placeholder) onto the underlying Select', () => {
    render(
      <SearchableSelect options={options} value={null} onChange={jest.fn()} placeholder="Choose an option" />,
    );

    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  // The curated-collections hint in CollectionSelection (issue #1221) is a plain option carrying
  // `isDisabled: true`, relying on react-select's default isOptionDisabled. These guard against a
  // future `components`/`isOptionDisabled` override here silently making such an option clickable.
  test('renders an option with isDisabled as aria-disabled', () => {
    const optionsWithDisabled = [...options, { value: 'd', label: 'Delta', isDisabled: true }];
    const { container } = render(
      <SearchableSelect options={optionsWithDisabled} value={null} onChange={jest.fn()} />,
    );

    openMenu(container);

    expect(screen.getByRole('option', { name: 'Delta' })).toHaveAttribute('aria-disabled', 'true');
  });

  test('clicking an option with isDisabled does not call onChange', () => {
    const onChange = jest.fn();
    const optionsWithDisabled = [...options, { value: 'd', label: 'Delta', isDisabled: true }];
    const { container } = render(
      <SearchableSelect options={optionsWithDisabled} value={null} onChange={onChange} />,
    );

    openMenu(container);
    fireEvent.click(screen.getByRole('option', { name: 'Delta' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
