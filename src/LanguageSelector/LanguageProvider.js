import React from 'react';
import { connect } from 'react-redux';

import store, { languageSlice } from '../store';
import { changeLanguage, getLanguage } from './langUtils';

class LanguageProvider extends React.Component {
  async componentDidMount() {
    const language = getLanguage();
    await changeLanguage(language);
    store.dispatch(languageSlice.actions.setLanguage(language));
  }

  render() {
    return this.props.children;
  }
}

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps)(LanguageProvider);
