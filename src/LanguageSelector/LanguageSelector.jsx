import React, { useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import BG from 'country-flag-icons/react/3x2/BG';
import CZ from 'country-flag-icons/react/3x2/CZ';
import DE from 'country-flag-icons/react/3x2/DE';
import DK from 'country-flag-icons/react/3x2/DK';
import EE from 'country-flag-icons/react/3x2/EE';
import ES from 'country-flag-icons/react/3x2/ES';
import FI from 'country-flag-icons/react/3x2/FI';
import FR from 'country-flag-icons/react/3x2/FR';
import GB from 'country-flag-icons/react/3x2/GB';
import GR from 'country-flag-icons/react/3x2/GR';
import HR from 'country-flag-icons/react/3x2/HR';
import HU from 'country-flag-icons/react/3x2/HU';
import IE from 'country-flag-icons/react/3x2/IE';
import IT from 'country-flag-icons/react/3x2/IT';
import LT from 'country-flag-icons/react/3x2/LT';
import LV from 'country-flag-icons/react/3x2/LV';
import MT from 'country-flag-icons/react/3x2/MT';
import NL from 'country-flag-icons/react/3x2/NL';
import PL from 'country-flag-icons/react/3x2/PL';
import PT from 'country-flag-icons/react/3x2/PT';
import RO from 'country-flag-icons/react/3x2/RO';
import SE from 'country-flag-icons/react/3x2/SE';
import SI from 'country-flag-icons/react/3x2/SI';
import SK from 'country-flag-icons/react/3x2/SK';
import UA from 'country-flag-icons/react/3x2/UA';

import ChevronDown from '../icons/chevron-down.svg?react';
import ChevronUp from '../icons/chevron-up.svg?react';
import CatalanFlag from './icons/catalan-flag.svg?react';
import PeopleGroup from './icons/people-group.svg?react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { changeLanguage } from './langUtils';
import { CDSE_GITHUB_PAGE_LINK } from '../const';
import './LanguageSelector.scss';
import { SUPPORTED_LANGUAGES } from './const';

const FLAG_COMPONENTS = {
  BG,
  CZ,
  DE,
  DK,
  EE,
  ES,
  FI,
  FR,
  GB,
  GR,
  HR,
  HU,
  IE,
  IT,
  LT,
  LV,
  MT,
  NL,
  PL,
  PT,
  RO,
  SE,
  SI,
  SK,
  UA,
};

const onSelectLanguage = async (lang) => {
  if (lang.flagCode === 'TO') {
    window.open(CDSE_GITHUB_PAGE_LINK, '_blank');
    return;
  }
  await changeLanguage(lang.langCode);
};

const FlagIcon = ({ lang }) => {
  if (lang.flagCode === 'CA') {
    return <CatalanFlag className="lang-flag lang-flag--custom" />;
  }
  if (lang.flagCode === 'TO') {
    return <PeopleGroup className="lang-flag lang-flag--custom" />;
  }
  const Flag = FLAG_COMPONENTS[lang.flagCode];
  return <Flag className="lang-flag lang-flag--svg" aria-hidden="true" />;
};

const LanguageSelector = () => {
  const selectedLanguage = useSelector((state) => state.language.selectedLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  const handleClickOutside = useCallback(() => setIsOpen(false), []);
  useOnClickOutside(ref, handleClickOutside);

  const selected = SUPPORTED_LANGUAGES.find((lang) => lang.langCode === selectedLanguage);

  const handleSelect = async (lang) => {
    setIsOpen(false);
    await onSelectLanguage(lang);
  };

  return (
    <div className="language-selector">
      {selectedLanguage ? (
        <div ref={ref} className={`menu-flags${isOpen ? ' menu-flags--open' : ''}`}>
          <button
            type="button"
            className="menu-flags__trigger"
            aria-expanded={isOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            <span className="menu-flags__lang-code">{selected?.langCode?.toUpperCase()}</span>
            {isOpen ? (
              <ChevronUp className="menu-flags__chevron" />
            ) : (
              <ChevronDown className="menu-flags__chevron" />
            )}
          </button>
          {isOpen && (
            <ul className="menu-flags__dropdown" role="listbox">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <li
                  key={lang.flagCode}
                  className={`menu-flags__option${
                    lang.flagCode === 'TO' ? ' menu-flags__option--more-info' : ''
                  }`}
                  role="option"
                  aria-selected={lang.langCode === selectedLanguage}
                  tabIndex={0}
                  onClick={() => handleSelect(lang)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(lang);
                    }
                  }}
                >
                  <FlagIcon lang={lang} />
                  <span className="menu-flags__option-label">{lang.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <i className="fa fa-globe menu-globe"></i>
      )}
    </div>
  );
};

export default LanguageSelector;
