import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';

import { Provider } from 'react-redux';
import store from '../../../store';

import DatePicker from '../DatePicker';

const stories = storiesOf('Datepicker', module);

stories.add('Datepicker', ({ state, setState }) => {
  const selectedDate = state.selectedDate || moment.utc('2019-11-11');
  return (
    <Provider store={store}>
      <div className="date-pickers-wrapper" style={{ background: '#3b3d4d' }}>
        <DatePicker
          id="date-picker-story"
          setSelectedDay={(date) => setState({ selectedDate: date })}
          selectedDay={selectedDate}
          calendarContainer={document.body}
          minDate={moment.utc('1984-01-01')}
          maxDate={moment.utc('2019-12-31')}
        />
      </div>
    </Provider>
  );
});

stories.add('Datepicker custom dates', ({ state, setState }) => {
  const selectedDate = state.selectedDate || moment.utc('2019-11-11');
  return (
    <Provider store={store}>
      <div style={{ background: '#3b3d4d' }}>
        <DatePicker
          setSelectedDay={(date) => setState({ selectedDate: date })}
          selectedDay={selectedDate}
          showNextPrev={false}
          minDate={moment.utc('1984-01-01')}
          maxDate={moment.utc('2019-12-31')}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          calendarContainer={document.body}
        />
      </div>
    </Provider>
  );
});

stories.add('Datepicker prev/next buttons', ({ state, setState }) => {
  const getAndSetNextPrevDate = async (direction) => {
    const currentDate = state.selectedDate
      ? moment.utc(state.selectedDate.format('YYYY-MM-DD'))
      : moment.utc();
    const newDate = direction === 'prev' ? currentDate.subtract(1, 'day') : currentDate.add(1, 'day');
    setState({ selectedDate: newDate });
  };
  const selectedDate = state.selectedDate || moment.utc('2019-11-11');
  return (
    <Provider store={store}>
      <div style={{ background: '#3b3d4d' }}>
        <DatePicker
          setSelectedDay={(date) => setState({ selectedDate: date })}
          selectedDay={selectedDate}
          showNextPrevDateArrows={true}
          minDate={moment.utc('1984-01-01')}
          maxDate={moment.utc('2019-12-31')}
          getAndSetNextPrevDate={getAndSetNextPrevDate}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          calendarContainer={document.body}
        />
      </div>
    </Provider>
  );
});

stories.add('Datepicker prev/next buttons err', ({ state, setState }) => {
  const getAndSetNextPrevDate = async (direction) => {
    return new Promise((resolve, reject) => {
      console.log('No  available dates');
      reject('No  available dates');
    });
  };
  const selectedDate = state.selectedDate || moment.utc('2019-11-11');
  return (
    <Provider store={store}>
      <div style={{ background: '#3b3d4d' }}>
        <DatePicker
          setSelectedDay={(date) => setState({ selectedDate: date })}
          selectedDay={selectedDate}
          showNextPrevDateArrows={true}
          minDate={moment.utc('1984-01-01')}
          maxDate={moment.utc('2019-12-31')}
          getAndSetNextPrevDate={getAndSetNextPrevDate}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          calendarContainer={document.body}
        />
      </div>
    </Provider>
  );
});

function onQueryDatesForActiveMonth(date) {
  return new Promise((resolve) => {
    resolve([moment.utc(date).startOf('month').toDate()]);
  });
}
