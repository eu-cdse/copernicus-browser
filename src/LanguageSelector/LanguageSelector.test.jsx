import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock SVG imports — the project's fileTransform.cjs returns a plain string for the
// default export of .svg files, which is not a valid React element type. We replace each
// SVG with a lightweight functional component so LanguageSelector can render.
jest.mock('../icons/chevron-down.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'chevron-down' }),
  };
});

jest.mock('../icons/chevron-up.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'chevron-up' }),
  };
});

jest.mock('./icons/catalan-flag.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'catalan-flag' }),
  };
});

jest.mock('./icons/people-group.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('span', { ...props, 'data-testid': 'people-group' }),
  };
});

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('./langUtils', () => ({
  changeLanguage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../const', () => ({
  CDSE_GITHUB_PAGE_LINK: 'https://example.com/more-info',
}));

import { useSelector } from 'react-redux';
import { changeLanguage } from './langUtils';
import LanguageSelector from './LanguageSelector';

const setSelectedLanguage = (lang) => {
  useSelector.mockImplementation((selector) => selector({ language: { selectedLanguage: lang } }));
};

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSelectedLanguage('en');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    changeLanguage.mockResolvedValue(undefined);
  });

  test('shows globe icon fallback when selectedLanguage is falsy', () => {
    setSelectedLanguage(null);
    render(<LanguageSelector />);
    expect(document.querySelector('.fa.fa-globe.menu-globe')).toBeInTheDocument();
    expect(document.querySelector('.menu-flags')).not.toBeInTheDocument();
  });

  test('renders the trigger button with the current language code in uppercase', () => {
    render(<LanguageSelector />);
    const trigger = document.querySelector('button.menu-flags__trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger.querySelector('.menu-flags__lang-code')).toHaveTextContent('EN');
  });

  test('opens the dropdown when trigger button is clicked', () => {
    render(<LanguageSelector />);
    const trigger = document.querySelector('button.menu-flags__trigger');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.menu-flags__dropdown')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelector('.menu-flags__dropdown')).toBeInTheDocument();
  });

  test('renders all 14 language options in the dropdown', () => {
    render(<LanguageSelector />);
    fireEvent.click(document.querySelector('button.menu-flags__trigger'));

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(14);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('More info')).toBeInTheDocument();
  });

  test('closes the dropdown when trigger button is clicked again', () => {
    render(<LanguageSelector />);
    const trigger = document.querySelector('button.menu-flags__trigger');

    fireEvent.click(trigger);
    expect(document.querySelector('.menu-flags__dropdown')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(document.querySelector('.menu-flags__dropdown')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('calls changeLanguage with the correct lang code when a language option is selected', () => {
    render(<LanguageSelector />);
    fireEvent.click(document.querySelector('button.menu-flags__trigger'));

    const deutschOption = screen.getByText('Deutsch').closest('[role="option"]');
    fireEvent.click(deutschOption);

    expect(changeLanguage).toHaveBeenCalledTimes(1);
    expect(changeLanguage).toHaveBeenCalledWith('de');
  });

  test('closes the dropdown after selecting a language', () => {
    render(<LanguageSelector />);
    fireEvent.click(document.querySelector('button.menu-flags__trigger'));
    expect(document.querySelector('.menu-flags__dropdown')).toBeInTheDocument();

    const frenchOption = screen.getByText('Français').closest('[role="option"]');
    fireEvent.click(frenchOption);

    expect(document.querySelector('.menu-flags__dropdown')).not.toBeInTheDocument();
  });

  test('opens CDSE_GITHUB_PAGE_LINK in a new tab when "More info" is selected', () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    render(<LanguageSelector />);
    fireEvent.click(document.querySelector('button.menu-flags__trigger'));

    const moreInfoOption = screen.getByText('More info').closest('[role="option"]');
    fireEvent.click(moreInfoOption);

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/more-info', '_blank');
  });

  test('does NOT call changeLanguage when "More info" is selected', () => {
    jest.spyOn(window, 'open').mockImplementation(() => null);
    render(<LanguageSelector />);
    fireEvent.click(document.querySelector('button.menu-flags__trigger'));

    const moreInfoOption = screen.getByText('More info').closest('[role="option"]');
    fireEvent.click(moreInfoOption);

    expect(changeLanguage).not.toHaveBeenCalled();
  });

  test('selects a language when Enter is pressed on an option', () => {
    render(<LanguageSelector />);
    fireEvent.click(document.querySelector('button.menu-flags__trigger'));

    const deutschOption = screen.getByText('Deutsch').closest('[role="option"]');
    fireEvent.keyDown(deutschOption, { key: 'Enter' });

    expect(changeLanguage).toHaveBeenCalledWith('de');
    expect(document.querySelector('.menu-flags__dropdown')).not.toBeInTheDocument();
  });

  test('selects a language when Space is pressed on an option', () => {
    render(<LanguageSelector />);
    fireEvent.click(document.querySelector('button.menu-flags__trigger'));

    const frenchOption = screen.getByText('Français').closest('[role="option"]');
    fireEvent.keyDown(frenchOption, { key: ' ' });

    expect(changeLanguage).toHaveBeenCalledWith('fr');
  });

  test('closes the dropdown when clicking outside the component', () => {
    render(<LanguageSelector />);
    const trigger = document.querySelector('button.menu-flags__trigger');

    fireEvent.click(trigger);
    expect(document.querySelector('.menu-flags__dropdown')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(document.querySelector('.menu-flags__dropdown')).not.toBeInTheDocument();
  });

  test('does not close the dropdown when clicking inside the component', () => {
    render(<LanguageSelector />);
    const trigger = document.querySelector('button.menu-flags__trigger');

    fireEvent.click(trigger);
    expect(document.querySelector('.menu-flags__dropdown')).toBeInTheDocument();

    const menuFlags = document.querySelector('.menu-flags');
    fireEvent.mouseDown(menuFlags);

    expect(document.querySelector('.menu-flags__dropdown')).toBeInTheDocument();
  });

  test('shows uppercase lang code matching a non-English selected language', () => {
    setSelectedLanguage('de');
    render(<LanguageSelector />);
    const langCode = document.querySelector('.menu-flags__lang-code');
    expect(langCode).toHaveTextContent('DE');
  });
});
