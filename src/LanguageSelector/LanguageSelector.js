import React from 'react';
import { connect } from 'react-redux';
import ReactFlagsSelect from 'react-flags-select';

import store, { languageSlice } from '../store';
import { changeLanguage, SUPPORTED_LANGUAGES } from './langUtils';
import './LanguageSelector.scss';

const flagCodes = SUPPORTED_LANGUAGES.map((l) => l.flagCode);

const countriesNames = SUPPORTED_LANGUAGES.reduce((acc, elem) => {
  acc[elem.flagCode] = { primary: elem.text, secondary: elem.langCode };
  return acc;
}, {});

const onSelectFlag = async (flagCode) => {
  const selected = SUPPORTED_LANGUAGES.find((lang) => lang.flagCode === flagCode);
  if (!selected) {
    return;
  }
  await changeLanguage(selected.langCode);
  store.dispatch(languageSlice.actions.setLanguage(selected.langCode));
};

const LanguageSelector = ({ selectedLanguage }) => {
  const selected = SUPPORTED_LANGUAGES.find((lang) => lang.langCode === selectedLanguage);

  return (
    <div className="language-selector">
      {selectedLanguage ? (
        <ReactFlagsSelect
          className="menu-flags"
          countries={flagCodes}
          customLabels={countriesNames}
          showSelectedLabel={false}
          showSecondarySelectedLabel={true}
          showSecondaryOptionLabel={false}
          selected={selected?.flagCode}
          onSelect={onSelectFlag}
          selectedSize={16}
          fullWidth={false}
        />
      ) : (
        <i className="fa fa-globe menu-globe"></i>
      )}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(LanguageSelector);
