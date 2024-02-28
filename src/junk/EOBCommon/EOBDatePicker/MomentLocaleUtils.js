import moment from 'moment';

export const getFirstDayOfWeek = (locale) => moment.localeData(locale).firstDayOfWeek();

export const getWeekDaysMin = (locale) => moment.localeData(locale).weekdaysMin();

export const getWeekDaysLong = (locale) => moment.localeData(locale).weekdays();

export const getMonths = (locale) => moment.localeData(locale).months();

export const getShortMonth = (monthNum, locale) => moment.localeData(locale).monthsShort()[monthNum];
