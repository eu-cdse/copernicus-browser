import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { TABS } from '../../../../const';
import RecursiveCollectionForm from './RecursiveCollectionForm';

jest.mock('./collectionFormConfig.utils', () => ({
  ...jest.requireActual('./collectionFormConfig.utils'),
  getCollectionFormConfig: () => [
    {
      id: 'WITH_FILTERS',
      label: 'With filters',
      platform: 'P1',
      additionalFilters: [{ id: 'f1', render: () => <div key="f1">Filter one</div> }],
    },
    { id: 'NO_FILTERS', label: 'No filters', platform: 'P2' },
  ],
}));

jest.mock('./filters/AdditionalFilters.utils', () => ({
  getAllFiltersForCollection: (collection) => collection.additionalFilters,
}));

jest.mock('../../../../components/CustomCheckbox/CustomCheckbox', () => ({
  __esModule: true,
  default: ({ checked, onChange, label }) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  ),
}));

jest.mock('./filters/SelectedFiltersList', () => ({
  __esModule: true,
  default: () => null,
}));

const makeStore = () =>
  configureStore({
    reducer: {
      tabs: () => ({ selectedTabIndex: TABS.SEARCH_TAB, scrollTop: 0 }),
      searchResults: () => ({ resultsPanelSelected: false }),
      auth: () => ({ user: { access_token: 'token' } }),
      language: () => ({ selectedLanguage: 'en' }),
    },
  });

const renderForm = (selectedCollections) => {
  const props = {
    selectedCollections,
    maxCc: {},
    setSelectedCollections: jest.fn(),
    setMaxCc: jest.fn(),
    setSelectedFilters: jest.fn(),
    resetSelectedFilters: jest.fn(),
    setAdditionalFiltersPositionTop: jest.fn(),
    setCollectionForm: jest.fn(),
    additionFiltersPositionTop: 200,
  };
  render(
    <Provider store={makeStore()}>
      <RecursiveCollectionForm {...props} />
    </Provider>,
  );
  return props;
};

describe('RecursiveCollectionForm additional filters toggle', () => {
  it('renders the Filters button only for collections with additionalFilters', () => {
    renderForm({ WITH_FILTERS: { platform: 'P1' }, NO_FILTERS: { platform: 'P2' } });
    expect(screen.getAllByRole('button', { name: 'Filters' })).toHaveLength(1);
  });

  it('disables Filters while the collection is not selected', () => {
    renderForm({});
    expect(screen.getByRole('button', { name: 'Filters' })).toBeDisabled();
  });

  it('enables Filters once the collection is selected', () => {
    renderForm({ WITH_FILTERS: { platform: 'P1' } });
    expect(screen.getByRole('button', { name: 'Filters' })).toBeEnabled();
  });

  it('opens and closes the panel without toggling the collection', () => {
    const props = renderForm({ WITH_FILTERS: { platform: 'P1' } });
    const toggle = screen.getByRole('button', { name: 'Filters' });
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByText('Filter one')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();

    expect(props.setSelectedCollections).not.toHaveBeenCalled();
  });

  it('closes the panel via its Close button', () => {
    renderForm({ WITH_FILTERS: { platform: 'P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });
});
