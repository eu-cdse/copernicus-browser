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

const DEFAULT_THEME_ID = 'theme1';

// Shared by every test in this file. Also assigns to mockCurrentTestStore so the mocked
// `../../../store` default export above always resolves to the store currently under test —
// harmless for tests that render through <Provider> only and never touch that module directly.
function makeStore({ themes = [], userName = 'test-user' } = {}) {
  mockCurrentTestStore = configureStore({
    reducer: {
      themes: (state = {}) => state,
      auth: (state = {}) => state,
      language: (state = {}) => state,
      visualization: (state = {}) => state,
      collapsiblePanel: (state = {}) => state,
      externalLayers: (state = {}) => state,
      panel: (state = {}) => state,
    },
    preloadedState: {
      themes: {
        selectedThemeId: DEFAULT_THEME_ID,
        themesLists: {
          [MODE_THEMES_LIST]: themes,
          [USER_INSTANCES_THEMES_LIST]: [],
          [URL_THEMES_LIST]: [],
          RRD: [],
        },
      },
      auth: { user: { userdata: { name: userName } } },
      language: { selectedLanguage: 'en' },
      visualization: { toTime: null },
      collapsiblePanel: { themePanelExpanded: false },
      externalLayers: {},
      panel: { wms: false },
    },
  });
  return mockCurrentTestStore;
}

function renderThemeSelect(props, storeOptions) {
  const setShowLayerPanel = jest.fn();
  const setShowHighlightPanel = jest.fn();
  const utils = render(
    <Provider store={makeStore(storeOptions)}>
      <ThemeSelect
        setShowLayerPanel={setShowLayerPanel}
        setShowHighlightPanel={setShowHighlightPanel}
        highlightsAvailable={false}
        compareShare={false}
        showPinPanel={false}
        showComparePanel={false}
        {...props}
      />
    </Provider>,
  );
  return { ...utils, setShowLayerPanel, setShowHighlightPanel };
}

// Covers #1184 F3: the useEffect guard added to avoid bouncing back to Layers/Highlights while the
// Pins or Compare panel is showing (e.g. right after a shared-pins import switches to the Pins panel).
describe('ThemeSelect — highlightsAvailable effect panel-race guard (#1184 F3)', () => {
  it('does not switch to the Layers/Highlights panel while the Pins panel is showing', () => {
    const { setShowLayerPanel, setShowHighlightPanel } = renderThemeSelect({
      showPinPanel: true,
      highlightsAvailable: false,
    });

    expect(setShowLayerPanel).not.toHaveBeenCalled();
    expect(setShowHighlightPanel).not.toHaveBeenCalled();
  });

  it('does not switch to the Layers/Highlights panel while the Compare panel is showing', () => {
    const { setShowLayerPanel, setShowHighlightPanel } = renderThemeSelect({
      showComparePanel: true,
      highlightsAvailable: true,
    });

    expect(setShowLayerPanel).not.toHaveBeenCalled();
    expect(setShowHighlightPanel).not.toHaveBeenCalled();
  });

  it('switches to the Layers panel when neither the Pins nor the Compare panel is showing', () => {
    const { setShowLayerPanel, setShowHighlightPanel } = renderThemeSelect({
      highlightsAvailable: false,
    });

    expect(setShowLayerPanel).toHaveBeenCalledWith(true);
    expect(setShowHighlightPanel).not.toHaveBeenCalled();
  });

  it('switches to the Highlights panel when highlights are available and no other panel is pending', () => {
    const { setShowLayerPanel, setShowHighlightPanel } = renderThemeSelect({
      highlightsAvailable: true,
    });

    expect(setShowHighlightPanel).toHaveBeenCalledWith(true);
    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });
});

// Covers the reviewer-reported panel-consistency bug: refreshing while on the Layers panel (the
// implicit/explicit default) with a non-default theme selected was landing on Highlights instead,
// because this same effect ran once on mount regardless of what URLParamsParser's setStore had
// already restored from the `panel` URL param via panelSlice.actions.openPanel. When the URL carried
// an explicit panel value, the first run must be a no-op so the just-restored panel survives.
describe('ThemeSelect — does not clobber a panel restored from an explicit `panel` URL param', () => {
  it('does not switch away from Layers on mount when panel=layers was explicit and the theme has highlights', () => {
    const { setShowLayerPanel, setShowHighlightPanel } = renderThemeSelect({
      highlightsAvailable: true,
      panelFromUrlParams: 'layers',
    });

    expect(setShowLayerPanel).not.toHaveBeenCalled();
    expect(setShowHighlightPanel).not.toHaveBeenCalled();
  });

  it('does not switch away from Highlights on mount when panel=highlights was explicit and highlightsAvailable has not resolved yet', () => {
    const { setShowLayerPanel, setShowHighlightPanel } = renderThemeSelect({
      highlightsAvailable: false,
      panelFromUrlParams: 'highlights',
    });

    expect(setShowLayerPanel).not.toHaveBeenCalled();
    expect(setShowHighlightPanel).not.toHaveBeenCalled();
  });

  it('still applies the theme default on mount when no panel was explicit in the URL', () => {
    const { setShowLayerPanel, setShowHighlightPanel } = renderThemeSelect({
      highlightsAvailable: true,
      panelFromUrlParams: undefined,
    });

    expect(setShowHighlightPanel).toHaveBeenCalledWith(true);
    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });
});

// Covers the reported follow-up bug: leaving a non-Highlights panel open, visiting the Order tab,
// then returning to Visualize was force-switching back to Highlights, because a later re-render
// recomputing the same highlightsAvailable transition (e.g. ThemesProvider's
// fetchUserInstances/getRRDInstances resolving late) reran the auto-open logic with no memory that
// it had already applied it once.
describe('ThemeSelect — does not re-open Highlights after the user has navigated away (#1184 follow-up)', () => {
  it('does not force Highlights again once highlightsAvailable has already triggered it once', () => {
    const setShowLayerPanel = jest.fn();
    const setShowHighlightPanel = jest.fn();
    const store = makeStore();
    const baseProps = {
      setShowLayerPanel,
      setShowHighlightPanel,
      compareShare: false,
      showPinPanel: false,
      showComparePanel: false,
    };

    const { rerender } = render(
      <Provider store={store}>
        <ThemeSelect {...baseProps} highlightsAvailable={false} />
      </Provider>,
    );
    expect(setShowLayerPanel).toHaveBeenCalledWith(true);

    rerender(
      <Provider store={store}>
        <ThemeSelect {...baseProps} highlightsAvailable={true} />
      </Provider>,
    );
    expect(setShowHighlightPanel).toHaveBeenCalledWith(true);

    setShowHighlightPanel.mockClear();
    setShowLayerPanel.mockClear();

    // The user manually switches back to Layers (parent-owned state, not modeled here), then a
    // later spurious re-render flips highlightsAvailable false then true again.
    rerender(
      <Provider store={store}>
        <ThemeSelect {...baseProps} highlightsAvailable={false} />
      </Provider>,
    );
    setShowHighlightPanel.mockClear();
    setShowLayerPanel.mockClear();

    rerender(
      <Provider store={store}>
        <ThemeSelect {...baseProps} highlightsAvailable={true} />
      </Provider>,
    );

    expect(setShowHighlightPanel).not.toHaveBeenCalled();
  });
});

const TOOLTIP_TEST_STORE_OPTIONS = {
  themes: [{ id: DEFAULT_THEME_ID, name: 'Theme A', content: [] }],
  userName: 'Tester',
};

describe('ThemeSelect configuration info button', () => {
  test('renders the info icon next to the configuration dropdown', () => {
    const { container } = renderThemeSelect({}, TOOLTIP_TEST_STORE_OPTIONS);

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
    renderThemeSelect({}, TOOLTIP_TEST_STORE_OPTIONS);

    expect(screen.queryByText(/determines which collections/)).not.toBeInTheDocument();
  });

  test('clicking the icon reveals all three explanation points', async () => {
    const { container } = renderThemeSelect({}, TOOLTIP_TEST_STORE_OPTIONS);

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
      <Provider
        store={makeStore({
          themes: [{ id: DEFAULT_THEME_ID, name: 'Theme A', content: [] }],
          userName: 'Tester',
        })}
      >
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
