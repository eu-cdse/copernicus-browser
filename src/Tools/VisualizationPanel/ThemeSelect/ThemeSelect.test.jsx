import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import ThemeSelect from './ThemeSelect';
import { MODE_THEMES_LIST, USER_INSTANCES_THEMES_LIST, URL_THEMES_LIST } from '../../../const';

let mockCurrentTestStore;
jest.mock('../../../store', () => {
  const actual = jest.requireActual('../../../store');
  return {
    __esModule: true,
    ...actual,
    get default() {
      return mockCurrentTestStore;
    },
  };
});

jest.mock('../../../Auth/loginLogout/useLoginLogout', () => () => ({ doLogin: jest.fn() }));

// The real indicator imports `*.svg?react`, which jest's fileTransform maps to a plain
// object rather than a component. It is not under test here.
jest.mock('../../../components/CustomSelectInput/CustomDropdownIndicator', () => ({
  CustomDropdownIndicator: () => null,
}));

const THEME_ID = 'theme1';

function makeStore() {
  mockCurrentTestStore = configureStore({
    reducer: {
      auth: (state = { user: { userdata: { name: 'Tester' } } }) => state,
      themes: (
        state = {
          selectedThemeId: THEME_ID,
          themesLists: {
            [MODE_THEMES_LIST]: [{ id: THEME_ID, name: 'Theme A', content: [] }],
            [USER_INSTANCES_THEMES_LIST]: [],
            [URL_THEMES_LIST]: [],
            RRD: [],
          },
        },
      ) => state,
      language: (state = { selectedLanguage: 'en' }) => state,
      visualization: (state = { toTime: null }) => state,
      collapsiblePanel: (state = { themePanelExpanded: false }) => state,
    },
  });
  return mockCurrentTestStore;
}

function renderComponent() {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <ThemeSelect
        compareShare={false}
        setShowLayerPanel={jest.fn()}
        setShowHighlightPanel={jest.fn()}
        highlightsAvailable={false}
      />
    </Provider>,
  );
}

describe('ThemeSelect configuration info button', () => {
  test('renders the info icon next to the configuration dropdown', () => {
    const { container } = renderComponent();

    const dropdownRow = container.querySelector('.theme-select-highlights-wrapper');
    expect(dropdownRow).toBeInTheDocument();
    // the icon is a sibling of the dropdown, not of the "Configuration:" label
    expect(dropdownRow.querySelector('.theme-label-select-wrapper')).toBeInTheDocument();
    expect(dropdownRow.querySelector('.collection-tooltip-icon')).toBeInTheDocument();
    expect(dropdownRow.querySelector('.fa.fa-info')).toBeInTheDocument();
    expect(container.querySelector('.theme-title')).not.toContainElement(
      container.querySelector('.collection-tooltip-icon'),
    );
  });

  test('tooltip content is not rendered before the icon is clicked', () => {
    renderComponent();

    expect(screen.queryByText(/determines which collections/)).not.toBeInTheDocument();
  });

  test('clicking the icon reveals all three explanation points', async () => {
    const { container } = renderComponent();

    fireEvent.click(container.querySelector('.collection-tooltip-icon'));

    await waitFor(() => {
      expect(screen.getByText(/determines which collections/)).toBeInTheDocument();
    });
    expect(screen.getByText(/curated list of collections/)).toBeInTheDocument();
    expect(screen.getByText(/are your own instances/)).toBeInTheDocument();
    expect(screen.getByText(/shown by default for our prepared configurations/)).toBeInTheDocument();
  });

  test('clicking outside closes the tooltip', async () => {
    const { container } = render(
      <Provider store={makeStore()}>
        <div>
          <ThemeSelect
            compareShare={false}
            setShowLayerPanel={jest.fn()}
            setShowHighlightPanel={jest.fn()}
            highlightsAvailable={false}
          />
          <button data-testid="outside-button">Outside</button>
        </div>
      </Provider>,
    );

    fireEvent.click(container.querySelector('.collection-tooltip-icon'));
    await waitFor(() => {
      expect(screen.getByText(/determines which collections/)).toBeInTheDocument();
    });

    // @floating-ui/react useDismiss detects outside clicks on pointerdown, not click
    fireEvent.pointerDown(screen.getByTestId('outside-button'));

    await waitFor(() => {
      expect(screen.queryByText(/determines which collections/)).not.toBeInTheDocument();
    });
  });
});
