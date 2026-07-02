import React, { act } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { createRoot, Root } from 'react-dom/client';
import Results from './Results';

type Tile = { id: string; name: string };

// ResultItem is a heavy, store-connected component; stub it so the test can focus
// on the Results component itself without wiring up the full Redux store.
jest.mock('./ResultItem', () => ({
  __esModule: true,
  default: ({ tile }: { tile?: Tile }) => <div data-testid="result-item">{tile?.name}</div>,
  ErrorMessage: {
    atleastOneProductSelected: () => 'at least one product',
  },
}));

jest.mock('../../junk/EOBCommon/EOBButton/EOBButton', () => ({
  __esModule: true,
  EOBButton: ({ text, onClick }: { text?: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {text}
    </button>
  ),
}));

// The real CustomCheckbox renders a CheckMark svg when checked, which is not a
// valid component under jest's svg transform; stub it to a plain checkbox input.
jest.mock('../../components/CustomCheckbox/CustomCheckbox', () => ({
  __esModule: true,
  default: ({
    label,
    checked,
    onChange,
  }: {
    label?: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <label>
      <input type="checkbox" aria-label={label} checked={!!checked} onChange={onChange} />
      {label}
    </label>
  ),
}));

jest.mock('./ResultItemFooter', () => ({
  __esModule: true,
  ResultItemFooter: () => null,
  ResultItemLabels: {
    addProductsToWorkspace: () => 'add to workspace',
    loginToAddToWorkspace: () => 'login to add',
  },
}));

const products: Tile[] = [
  { id: '1', name: 'product-1' },
  { id: '2', name: 'product-2' },
];

describe('Results', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const render = async (root: Root, props: Record<string, unknown>) => {
    await act(async () => {
      root.render(<Results isAuthenticated={true} {...props} />);
    });
  };

  it('renders no result items for an empty results list', async () => {
    const root = createRoot(container);
    await render(root, { results: [] });

    expect(screen.queryAllByTestId('result-item')).toHaveLength(0);
    expect(screen.getByText('Showing 0 results')).toBeInTheDocument();
  });

  it('renders the result count string (plural, singular, and total)', async () => {
    const root = createRoot(container);

    await render(root, { results: products });
    expect(screen.getByText('Showing 2 results')).toBeInTheDocument();

    await render(root, { results: [products[0]] });
    expect(screen.getByText('Showing 1 result')).toBeInTheDocument();

    // "of {totalCount}" is only appended when there are more results to load.
    await render(root, { results: products, hasMore: true, totalCount: 50 });
    expect(screen.getByText('Showing 2 results of 50')).toBeInTheDocument();
  });

  it('renders one ResultItem per product', async () => {
    const root = createRoot(container);
    await render(root, { results: [...products, { id: '3', name: 'product-3' }] });

    expect(screen.getAllByTestId('result-item')).toHaveLength(3);
  });

  it('shows the geometry-simplified warning and hides it when dismissed', async () => {
    const root = createRoot(container);
    await render(root, { results: products, geometrySimplifiedWarning: 'Geometry was simplified' });

    expect(screen.getByText('Geometry was simplified')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(container.querySelector('.close-message-panel') as Element);
    });

    expect(screen.queryByText('Geometry was simplified')).not.toBeInTheDocument();
  });

  it('renders "Load more" and calls getNextNResults when clicked', async () => {
    const getNextNResults = jest.fn().mockResolvedValue(undefined);
    const root = createRoot(container);
    await render(root, { results: products, hasMore: true, getNextNResults });

    const loadMore = screen.getByText('Load more');
    await act(async () => {
      fireEvent.click(loadMore);
    });

    expect(getNextNResults).toHaveBeenCalledTimes(1);
  });

  it('toggles all products with the "Select all" checkbox', async () => {
    const root = createRoot(container);
    await render(root, { results: products });

    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement;
    expect(selectAll.checked).toBe(false);

    await act(async () => {
      fireEvent.click(selectAll);
    });
    expect((screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement).checked).toBe(true);

    await act(async () => {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select all' }));
    });
    expect((screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement).checked).toBe(false);
  });

  it('applies the multiple-tiles class only when more than one tile is selected', async () => {
    const root = createRoot(container);

    // Two selected tiles -> multiple-tiles modifier.
    await render(root, { results: products, selectedTiles: undefined });
    await render(root, { results: products, selectedTiles: products });
    expect(container.querySelector('.rodal')?.classList.contains('multiple-tiles')).toBe(true);

    // A single selected tile -> no modifier, and a singular count string.
    await render(root, { results: products, selectedTiles: [products[0]] });
    expect(container.querySelector('.rodal')?.classList.contains('multiple-tiles')).toBe(false);
    expect(screen.getByText('Showing 1 result')).toBeInTheDocument();
  });

  it('opens the results modal when selectedTiles becomes set', async () => {
    const root = createRoot(container);

    await render(root, { results: products, selectedTiles: undefined });
    expect(screen.queryByText('Results')).not.toBeInTheDocument();

    await render(root, { results: products, selectedTiles: products });
    expect(screen.queryByText('Results')).toBeInTheDocument();
  });

  // Regression for #1123: closing the RRD modal clears selectedTiles to undefined
  // while displayModal is still true. render() must not read selectedTiles.length
  // on undefined and crash to a white screen.
  it('does not crash and closes the modal when selectedTiles is cleared', async () => {
    const root = createRoot(container);

    await render(root, { results: products, selectedTiles: undefined });
    await render(root, { results: products, selectedTiles: products });
    expect(screen.queryByText('Results')).toBeInTheDocument();

    // Clearing selectedTiles must neither throw nor leave the modal open.
    await render(root, { results: products, selectedTiles: undefined });
    expect(screen.queryByText('Results')).not.toBeInTheDocument();
  });
});
