import { enUS, ca, de, es, fr, it, lv, lt, hu, nl, pl, sl, uk } from 'react-day-picker/locale';

const LOCALE_MAP = {
  en: enUS,
  ca,
  de,
  es,
  fr,
  it,
  lv,
  lt,
  hu,
  nl,
  pl,
  sl,
  uk,
};

export const getLocaleObject = (localeCode) => LOCALE_MAP[localeCode] || enUS;
