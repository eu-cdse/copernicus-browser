import React from 'react';
import { connect } from 'react-redux';
import ReactFlagsSelect from 'react-flags-select';

import store, { languageSlice } from '../store';
import { changeLanguage, SUPPORTED_LANGUAGES } from './langUtils';
import { CDSE_GITHUB_PAGE_LINK } from '../const';
import './LanguageSelector.scss';

const flagCodes = SUPPORTED_LANGUAGES.map((l) => l.flagCode);

const countriesNames = SUPPORTED_LANGUAGES.reduce((acc, elem) => {
  acc[elem.flagCode] = { primary: elem.text, secondary: elem.langCode };
  return acc;
}, {});

const onSelectFlag = async (flagCode) => {
  const selected = SUPPORTED_LANGUAGES.find((lang) => lang.flagCode === flagCode);

  /*
    The below logic block will run if "TO -> (More Info)" pseudo option is selected,
    and instead of handling the translation of the app is used to redirect on the 
    following extracted link -> CDSE_GITHUB_PAGE_LINK
  */
  if (selected.text === countriesNames.TO.primary) {
    window.open(CDSE_GITHUB_PAGE_LINK, '_blank');
    return;
  }

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
