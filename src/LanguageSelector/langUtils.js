import { useLocale, addLocale } from 'ttag';
import moment from 'moment';
import axios from 'axios';
import store, { languageSlice } from '../store';

export const LOCAL_STORAGE_KEY = 'copernicus_browser_lang';
export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGUAGES = [
  { langCode: 'en', text: 'English', flagCode: 'GB' },
  { langCode: 'ca', text: 'Català', flagCode: 'CA' }, // CA by default represents Canada, in our case is modified to be used for Catalan until the proper language code and flag code is added to the library that we use.
  { langCode: 'de', text: 'Deutsch', flagCode: 'DE' },
  { langCode: 'es', text: 'Español', flagCode: 'ES' },
  { langCode: 'fr', text: 'Français', flagCode: 'FR' },
  { langCode: 'it', text: 'Italiano', flagCode: 'IT' },
  { langCode: 'lv', text: 'Latviešu', flagCode: 'LV' },
  { langCode: 'hu', text: 'Magyar', flagCode: 'HU' },
  { langCode: 'nl', text: 'Nederlands', flagCode: 'NL' },
  { langCode: 'pl', text: 'Polski', flagCode: 'PL' },
  { langCode: 'sl', text: 'Slovenščina', flagCode: 'SI' },
  { langCode: 'uk', text: 'Українська', flagCode: 'UA' },

  /* TO is language that won't be translated in the near future and is used as a pseudo option link for 'More Info' */
  { text: 'More info', flagCode: 'TO' },
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
  if (!storedLang || !SUPPORTED_LANGUAGES.find((l) => l.langCode === storedLang)) {
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
    `${import.meta.env.VITE_ROOT_URL}translations/${locale}.po.json`,
  );
  if (import.meta.env.VITE_DEBUG_TRANSLATIONS === 'true') {
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
