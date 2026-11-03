import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('../../../../../variables.module.scss', () => ({
  __esModule: true,
  default: { toolsWidth: '450px', additionalFiltersPanelWidth: '280px' },
}));

import AdditionalFilters from './AdditionalFilters';

const filters = [{ id: 'a', render: () => <div key="a">Filter A</div> }];

const setWindow = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: height });
};

const renderPanel = (props = {}) => {
  const allProps = {
    collectionId: 'col',
    title: 'My collection',
    onClose: jest.fn(),
    onReset: jest.fn(),
    onChange: jest.fn(),
    allFilters: filters,
    positionTop: 300,
    ...props,
  };
  const result = render(<AdditionalFilters {...allProps} />);
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  return { ...result, props: allProps };
};

const getPanel = (container: HTMLElement) => container.querySelector('.additional-filters') as HTMLElement;

describe('AdditionalFilters', () => {
  let attribution: HTMLElement | null;
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;

  // header 50 + content 300 + footer 50 = 400
  const mockSizes = (contentHeight: number) => {
    jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(contentHeight);
    jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(50);
  };

  const addAttribution = (top: number) => {
    document.body.innerHTML = '<div id="map"><div class="leaflet-control-attribution"></div></div>';
    attribution = document.querySelector('.leaflet-control-attribution');
    jest.spyOn(attribution as HTMLElement, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
  };

  beforeEach(() => {
    attribution = null;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
    setWindow(originalWidth, originalHeight);
  });

  it('renders title, filters and calls onClose / onReset', () => {
    setWindow(1200, 900);
    const { props } = renderPanel();
    expect(screen.getByText('My collection')).toBeInTheDocument();
    expect(screen.getByText('Filter A')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(props.onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it('does not render an svg chevron', () => {
    setWindow(1200, 900);
    const { container } = renderPanel();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders nothing when allFilters is not provided', () => {
    setWindow(1200, 900);
    const { container } = renderPanel({ allFilters: undefined });
    expect(container).toBeEmptyDOMElement();
  });

  it('passes value, onChange and userToken to the filter render function', () => {
    setWindow(1200, 900);
    const renderFn = jest.fn(() => <div key="a">A</div>);
    const onChange = jest.fn();
    renderPanel({
      allFilters: [{ id: 'a', render: renderFn }],
      selectedFilters: { a: 'v' },
      onChange,
      userToken: 'tok',
    });
    const args = (renderFn.mock.calls[0] as unknown[])[0] as {
      value: unknown;
      userToken: string;
      onChange: (v: unknown) => void;
    };
    expect(args.value).toBe('v');
    expect(args.userToken).toBe('tok');
    args.onChange('new');
    expect(onChange).toHaveBeenCalledWith('col', 'a', 'new');
  });

  it('wide layout and fits: top equals positionTop, no maxHeight', () => {
    setWindow(1200, 900);
    addAttribution(800);
    mockSizes(300);
    const { container } = renderPanel({ positionTop: 300 });
    const panel = getPanel(container);
    expect(panel.style.top).toBe('300px');
    expect(panel.style.maxHeight).toBe('');
  });

  it('wide layout and does not fit: bottom edge sits above the attribution bar', () => {
    setWindow(1200, 900);
    addAttribution(800); // limit 792
    mockSizes(300); // panel height 400
    const { container } = renderPanel({ positionTop: 700 });
    const panel = getPanel(container);
    expect(panel.style.top).toBe('392px');
    expect(panel.style.maxHeight).toBe('400px');
  });

  it('re-measures when the filters wrapper resizes, e.g. a filter is added after mount', () => {
    let resizeCallback: () => void = () => {};
    const observed: Element[] = [];
    const originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class {
      constructor(callback: () => void) {
        resizeCallback = callback;
      }
      observe(element: Element) {
        observed.push(element);
      }
      disconnect() {}
      unobserve() {}
    } as unknown as typeof ResizeObserver;

    try {
      setWindow(1200, 900);
      addAttribution(800); // limit 792
      mockSizes(300); // panel height 400
      const { container } = renderPanel({ positionTop: 700 });
      expect(observed).toEqual([getPanel(container).querySelector('.content')?.firstElementChild]);
      expect(getPanel(container).style.top).toBe('392px');

      mockSizes(500); // panel height 600
      act(() => resizeCallback());
      expect(getPanel(container).style.top).toBe('192px');
    } finally {
      window.ResizeObserver = originalResizeObserver;
    }
  });

  it('wide layout and taller than available: height is capped', () => {
    setWindow(1200, 900);
    addAttribution(800);
    mockSizes(2000);
    const { container } = renderPanel({ positionTop: 300 });
    const panel = getPanel(container);
    expect(panel.style.top).toBe('8px');
    expect(panel.style.maxHeight).toBe('784px');
  });

  it('falls back to the window height when there is no attribution element', () => {
    setWindow(1200, 600); // limit 592
    mockSizes(300); // panel height 400
    const { container } = renderPanel({ positionTop: 500 });
    const panel = getPanel(container);
    expect(panel.style.top).toBe('192px');
    expect(panel.style.maxHeight).toBe('400px');
  });

  it('narrow layout: no inline top', () => {
    setWindow(700, 900);
    addAttribution(800);
    mockSizes(300);
    const { container } = renderPanel({ positionTop: 300 });
    const panel = getPanel(container);
    expect(panel.style.top).toBe('');
    expect(panel.style.maxHeight).toBe('');
  });

  it('uses the wide layout only above toolsWidth + panelWidth (730)', () => {
    setWindow(730, 900);
    mockSizes(300);
    const { container } = renderPanel({ positionTop: 300 });
    expect(getPanel(container).style.top).toBe('');
  });
});
