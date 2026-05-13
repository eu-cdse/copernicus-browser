import moment from 'moment';

export const getMonths = (locale) => moment.localeData(locale).months();

export const getShortMonth = (monthNum, locale) => moment.localeData(locale).monthsShort()[monthNum];
