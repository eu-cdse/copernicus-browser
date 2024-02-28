import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TimelapseSidebarPins } from './TimelapseSidebarPins';
import store from '../../store';
import { Provider } from 'react-redux';

describe('TimelapseSidebarPins', () => {
  const pins = [
    { item: { title: 'Pin 1 title' } },
    { item: { title: 'Pin 2 title' } },
    { item: { title: 'Pin 3 title' } },
  ];

  it('should display no pins', () => {
    render(<TimelapseSidebarPins />);
    expect(screen.queryByText('Pins')).toBeNull();
  });

  it('should render pin header', () => {
    render(
      <Provider store={store}>
        <TimelapseSidebarPins pins={pins} />
      </Provider>,
    );
    expect(screen.queryByText('Pins')).toBeInTheDocument();
  });

  it('should render pins', () => {
    render(
      <Provider store={store}>
        <TimelapseSidebarPins pins={pins} />
      </Provider>,
    );
    expect(screen.queryByText('Pin 1 title')).toBeInTheDocument();
    expect(screen.queryByText('Pin 2 title')).toBeInTheDocument();
    expect(screen.queryByText('Pin 3 title')).toBeInTheDocument();
  });

  it('should call a callback on click', () => {
    const onAddPin = jest.fn();
    render(
      <Provider store={store}>
        <TimelapseSidebarPins pins={pins} onAddPin={onAddPin} />
      </Provider>,
    );

    fireEvent.click(screen.queryByText('Pin 1 title'));
    expect(onAddPin).toHaveBeenCalledWith({ title: 'Pin 1 title' });

    fireEvent.click(screen.queryByText('Pin 3 title'));
    expect(onAddPin).toHaveBeenCalledWith({ title: 'Pin 3 title' });
  });
});
