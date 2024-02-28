import React from 'react';
import moment from 'moment';
import { storiesOf } from '@storybook/react';
import { TimespanPicker } from '../TimespanPicker';
import { Provider } from 'react-redux';

import store from '../../../store';
const stories = storiesOf('TimespanPicker', module);

const initialTimespan = {
  fromTime: moment.utc('2020-08-01'),
  toTime: moment.utc('2020-08-08'),
};

stories.add('Timespan', ({ state, setState }) => {
  const timespan = state.timespan ? state.timespan : initialTimespan;
  return (
    <Provider store={store}>
      <div style={{ background: '#3b3d4d' }}>
        <TimespanPicker
          id="visualization-time-select"
          minDate={moment.utc('1984-01-01')}
          maxDate={moment.utc('2020-12-31')}
          timespan={timespan}
          applyTimespan={(fromTime, toTime) => setState({ timespan: { fromTime: fromTime, toTime: toTime } })}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
        />
      </div>
    </Provider>
  );
});

function onQueryDatesForActiveMonth(date) {
  return new Promise((resolve) => {
    resolve([moment(date).startOf('month').toDate()]);
  });
}
