import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';

import store, { externalLayersSlice } from '../store';
import ExternalWmsLayerContainer from './ExternalWmsLayerContainer';
import { useExternalServerLayers } from './useExternalServerLayers';

// The per-page dropdown (react-select) doesn't render meaningfully in jsdom and isn't under test.
jest.mock('react-select', () => () => null);

// The lazy GetCapabilities fetch itself is covered by useExternalServerLayers.test.ts; here we only
// need to control its {loading, error, retry} output to assert the container's rendering branches.
jest.mock('./useExternalServerLayers', () => ({
  useExternalServerLayers: jest.fn(),
}));

const mockUseExternalServerLayers = useExternalServerLayers as jest.Mock;

// Steady-state default (already-loaded layers, nothing in flight) so every test that isn't
// specifically about the loading/error states keeps behaving as if the fetch already resolved.
beforeEach(() => {
  mockUseExternalServerLayers.mockReturnValue({ loading: false, error: null, retry: jest.fn() });
});

// The chevron icons aren't valid components under jest's svg transform (see
// ExtraCollectionsPanel.test.tsx for the same workaround). Stub them to a passthrough <i> that
// keeps the title/onClick/className so the details-toggle assertions below can find and click them.
jest.mock('../icons/double-chevron-down.svg?react', () => ({
  __esModule: true,
  default: (props: React.HTMLAttributes<HTMLElement>) => <i {...props} />,
}));
jest.mock('../icons/double-chevron-up.svg?react', () => ({
  __esModule: true,
  default: (props: React.HTMLAttributes<HTMLElement>) => <i {...props} />,
}));

const SERVER = {
  id: 'test-server',
  name: 'Test Server',
  url: 'https://example.com/wms',
  type: 'WMS' as const,
  layers: [
    {
      id: 'layer1',
      name: 'layer1',
      title: 'Layer One',
      // metadataUrls reach the component already filtered to human-viewable web pages at parse time
      // (raw XML/data documents are dropped via isWebPageMetadata; see externalLayers.utils.test.ts).
      // The component only decides link-vs-plain-text by URL scheme.
      metadataUrls: [
        'https://www.geocat.ch/geonetwork/srv/ger/catalog.search#/metadata/e986a2d2', // web page -> link
        'javascript:alert(1)', // non-http scheme -> plain text, never a link
      ],
      attribution: 'https://provider.example.com/attribution',
      legendUrl: 'https://example.com/legend.png',
      abstract: 'Full abstract for layer one.',
    },
    {
      id: 'layer2',
      name: 'layer2',
      title: 'Layer Two',
      attribution: 'Plain Text Provider',
    },
  ],
};

// A server whose layers haven't been fetched yet (see useExternalServerLayers) — no `layers` at all.
const SERVER_NO_LAYERS = {
  id: 'test-server-no-layers',
  name: 'Test Server No Layers',
  url: 'https://example.com/wmts',
  type: 'WMS' as const,
};

const renderContainer = () =>
  render(
    <Provider store={store}>
      <ExternalWmsLayerContainer />
    </Provider>,
  );

describe('ExternalWmsLayerContainer metadata/attribution link rendering', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(SERVER));
    });
  });

  afterEach(() => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.removeExternalServer(SERVER.id));
    });
  });

  it('renders a web-page metadata URL as a link', () => {
    renderContainer();

    const link = screen.getByText('Metadata 1');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute(
      'href',
      'https://www.geocat.ch/geonetwork/srv/ger/catalog.search#/metadata/e986a2d2',
    );
  });

  it('renders a non-http metadata URL as plain text', () => {
    renderContainer();

    const notLink = screen.getByText('Metadata 2');
    expect(notLink.tagName).not.toBe('A');
    expect(notLink).not.toHaveAttribute('href');
  });

  it('renders a URL attribution as a link labelled with its hostname, full URL in the tooltip', () => {
    renderContainer();

    const link = screen.getByText('provider.example.com');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://provider.example.com/attribution');
    expect(link).toHaveAttribute('title', 'https://provider.example.com/attribution');
  });

  it('renders a non-URL attribution as plain text', () => {
    renderContainer();

    const notLink = screen.getByText('Plain Text Provider');
    expect(notLink.tagName).not.toBe('A');
  });
});

describe('ExternalWmsLayerContainer legend details toggle', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(SERVER));
    });
  });

  afterEach(() => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.removeExternalServer(SERVER.id));
    });
  });

  // addExternalServer activates the first layer (layer1, which has a legendUrl + abstract); layer2
  // has neither and is inactive, so its details toggle should never appear.
  it('shows the details toggle only on the active row that has details', () => {
    renderContainer();

    expect(screen.getByTitle('Show details')).toBeInTheDocument();
    // Only the active layer renders the icons block, so there is exactly one toggle.
    expect(screen.getAllByTitle('Show details')).toHaveLength(1);
  });

  it('renders the legend image and abstract when the details toggle is clicked, and hides them again', () => {
    renderContainer();

    // Collapsed by default: no legend image yet.
    expect(screen.queryByAltText('legend')).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTitle('Show details'));
    });

    const legend = screen.getByAltText('legend');
    expect(legend).toHaveAttribute('src', 'https://example.com/legend.png');
    // The abstract appears both truncated in the header and in full in the details; assert the
    // details copy specifically (scoped to .external-wms-layer-details).
    const details = legend.closest('.external-wms-layer-details') as HTMLElement;
    expect(details).toBeInTheDocument();
    expect(within(details).getByText('Full abstract for layer one.')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTitle('Hide details'));
    });
    expect(screen.queryByAltText('legend')).not.toBeInTheDocument();
  });

  it('renders a disabled details toggle for an active layer without legend or abstract', () => {
    act(() => {
      store.dispatch(
        externalLayersSlice.actions.setActiveExternalLayer({
          serverId: SERVER.id,
          layerName: 'layer2',
          layerId: 'layer2',
        }),
      );
    });
    renderContainer();

    expect(screen.getByTitle('Show details')).toHaveClass('disabled');
  });
});

describe('ExternalWmsLayerContainer lazy layer loading (useExternalServerLayers)', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(SERVER_NO_LAYERS));
    });
  });

  afterEach(() => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.removeExternalServer(SERVER_NO_LAYERS.id));
    });
  });

  it('shows the loader and not the empty state while the server has no layers yet and the hook is loading', () => {
    mockUseExternalServerLayers.mockReturnValue({ loading: true, error: null, retry: jest.fn() });

    const { container } = renderContainer();

    expect(container.querySelector('.loader')).toBeInTheDocument();
    expect(screen.queryByText('No layers match')).not.toBeInTheDocument();
  });

  it('renders the layer list (no loader) once loading finishes and the store has layers for the server', () => {
    mockUseExternalServerLayers.mockReturnValue({ loading: true, error: null, retry: jest.fn() });

    const { container, rerender } = renderContainer();
    expect(container.querySelector('.loader')).toBeInTheDocument();

    mockUseExternalServerLayers.mockReturnValue({ loading: false, error: null, retry: jest.fn() });
    act(() => {
      store.dispatch(
        externalLayersSlice.actions.updateServerLayers({
          serverId: SERVER_NO_LAYERS.id,
          layers: SERVER.layers,
        }),
      );
    });
    rerender(
      <Provider store={store}>
        <ExternalWmsLayerContainer />
      </Provider>,
    );

    expect(container.querySelector('.loader')).not.toBeInTheDocument();
    expect(screen.getByText('Layer One')).toBeInTheDocument();
  });

  it('shows the error state with a Retry button that calls the hook retry() when clicked', () => {
    const retry = jest.fn();
    const errorMessage =
      'Could not reach the server. It may be offline or may not allow cross-origin (CORS) access.';
    mockUseExternalServerLayers.mockReturnValue({ loading: false, error: errorMessage, retry });

    renderContainer();

    const errorBlock = document.querySelector('.external-wms-layer-error') as HTMLElement;
    expect(errorBlock).toBeInTheDocument();
    expect(within(errorBlock).getByText(errorMessage)).toBeInTheDocument();

    fireEvent.click(within(errorBlock).getByText('Retry'));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
