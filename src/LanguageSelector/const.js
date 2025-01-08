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
  { langCode: 'lt', text: 'Lietuvių', flagCode: 'LT' },
  { langCode: 'hu', text: 'Magyar', flagCode: 'HU' },
  { langCode: 'nl', text: 'Nederlands', flagCode: 'NL' },
  { langCode: 'pl', text: 'Polski', flagCode: 'PL' },
  { langCode: 'sl', text: 'Slovenščina', flagCode: 'SI' },
  { langCode: 'uk', text: 'Українська', flagCode: 'UA' },

  /* TO is language that won't be translated in the near future and is used as a pseudo option link for 'More Info' */
  { text: 'More info', flagCode: 'TO' },
];
