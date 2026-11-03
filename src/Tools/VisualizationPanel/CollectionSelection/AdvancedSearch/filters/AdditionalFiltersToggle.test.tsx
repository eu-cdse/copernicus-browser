import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import AdditionalFiltersToggle from './AdditionalFiltersToggle';

const makeStore = () => configureStore({ reducer: { tabs: () => ({ scrollTop: 0 }) } });

const renderToggle = (props = {}) => {
  const defaultProps = {
    isSelected: false,
    isDisplayed: false,
    onOpen: jest.fn(),
    selectedCollections: {},
    setAdditionalFiltersPositionTop: jest.fn(),
    disabled: false,
  };
  const allProps = { ...defaultProps, ...props };
  render(
    <Provider store={makeStore() as unknown as React.ComponentProps<typeof Provider>['store']}>
      <AdditionalFiltersToggle {...allProps} />
    </Provider>,
  );
  return allProps;
};

describe('AdditionalFiltersToggle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a Filters button with a font-awesome icon and no svg', () => {
    renderToggle();
    const button = screen.getByRole('button', { name: 'Filters' });
    expect(button.querySelector('.fa-filter')).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeNull();
  });

  it('calls onOpen when enabled and clicked', () => {
    const { onOpen } = renderToggle();
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not call onOpen when disabled', () => {
    const { onOpen } = renderToggle({ disabled: true });
    const button = screen.getByRole('button', { name: 'Filters' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it.each([true, false])('sets aria-expanded to %s following isSelected', (isSelected) => {
    renderToggle({ isSelected });
    expect(screen.getByRole('button', { name: 'Filters' })).toHaveAttribute(
      'aria-expanded',
      String(isSelected),
    );
  });

  it('reports the button top position when displayed', () => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 234 } as DOMRect);
    const { setAdditionalFiltersPositionTop } = renderToggle({ isDisplayed: true });
    expect(setAdditionalFiltersPositionTop).toHaveBeenCalledWith(234);
  });

  it('does not report a position when not displayed', () => {
    const { setAdditionalFiltersPositionTop } = renderToggle({ isDisplayed: false });
    expect(setAdditionalFiltersPositionTop).not.toHaveBeenCalled();
  });
});
