import { useLocale, addLocale } from 'ttag';
import moment from 'moment';
import axios from 'axios';
import store, { languageSlice } from '../store';

export const LOCAL_STORAGE_KEY = 'eobrowser_lang';
export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGUAGES = [
  { langCode: 'en', text: 'English', flagCode: 'GB' },
  { langCode: 'da', text: 'Dansk', flagCode: 'DK' },
  { langCode: 'de', text: 'Deutsch', flagCode: 'DE' },
  { langCode: 'et', text: 'Eesti keel', flagCode: 'EE' },
  { langCode: 'es', text: 'español', flagCode: 'ES' },
  { langCode: 'fr', text: 'Français', flagCode: 'FR' },
  { langCode: 'el', text: 'ελληνικά', flagCode: 'GR' },
  { langCode: 'lv', text: 'latviešu', flagCode: 'LV' },
  { langCode: 'pl', text: 'polski', flagCode: 'PL' },
  { langCode: 'pt', text: 'português', flagCode: 'PT' },
  { langCode: 'sl', text: 'slovenščina', flagCode: 'SI' },
  { langCode: 'fi', text: 'suomi', flagCode: 'FI' },
  { langCode: 'sv', text: 'Svenska', flagCode: 'SE' },
  { langCode: 'uk', text: 'Українська', flagCode: 'UA' },
];

export const changeLanguage = async (locale) => {
  await setTtagLocale(locale);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLocale(locale);
  saveLang(locale);
  moment.locale(locale);
  store.dispatch(languageSlice.actions.setLanguage(locale));
};

export const getLanguage = () => {
  const storedLang = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!storedLang) {
    saveLang(DEFAULT_LANG);
    return DEFAULT_LANG;
  }
  return storedLang;
};

const saveLang = (locale) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, locale);
};

const setTtagLocale = async (locale) => {
  const { data: ttagObject } = await axios.get(
    `${process.env.REACT_APP_ROOT_URL}translations/${locale}.po.json`,
  );
  if (process.env.REACT_APP_DEBUG_TRANSLATIONS === 'true') {
    makeDebugTranslations(ttagObject);
  }
  addLocale(locale, ttagObject);
};

function makeDebugTranslations(ttagObject) {
  const translations = ttagObject.translations[''];
  for (let key in translations) {
    if (translations[key].msgid.length === 0) {
      continue;
    }
    translations[key].msgstr = translations[key].msgstr.map((str) =>
      replaceStringWithXs(str === '' ? key : str),
    );
  }
}

function replaceStringWithXs(str) {
  const PERCENTAGE_OF_LENGTH = 80;
  let newStrArr = [];
  const newStrLength = Math.ceil(str.length * (PERCENTAGE_OF_LENGTH / 100));
  for (let i = 0; i <= newStrLength; i++) {
    newStrArr.push('x');
  }
  return newStrArr.join('');
}
