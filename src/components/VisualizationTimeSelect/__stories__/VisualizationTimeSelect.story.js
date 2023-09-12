import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { Provider } from 'react-redux';

import { VisualizationTimeSelect } from '../VisualizationTimeSelect';
import store from '../../../store';

const stories = storiesOf('Visualization time select', module);

stories.add('Default', ({ state, setState }) => {
  const fromTime = state.fromTime || moment.utc().startOf('day');

  const toTime = state.toTime || moment.utc().endOf('day');

  const getAndSetNextPrevDate = async (direction) => {
    await onGetAndSetNextPrevDate(direction, state.toTime, setState);
  };

  return (
    <WrappedVisualizationTimeSelect>
      <VisualizationTimeSelect
        minDate={moment.utc('1984-01-01')}
        maxDate={moment.utc()}
        getAndSetNextPrevDate={getAndSetNextPrevDate}
        onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
        showNextPrev={true}
        fromTime={fromTime}
        toTime={toTime}
        updateSelectedTime={(fromTime, toTime) => setState({ fromTime: fromTime, toTime: toTime })}
        timespanSupported={true}
      />
    </WrappedVisualizationTimeSelect>
  );
});

stories.add('Timespan disabled', ({ state, setState }) => {
  const fromTime = state.fromTime || moment.utc().startOf('day');
  const toTime = state.toTime || moment.utc().endOf('day');

  const getAndSetNextPrevDate = async (direction) => {
    await onGetAndSetNextPrevDate(direction, state.toTime, setState);
  };

  return (
    <WrappedVisualizationTimeSelect>
      <VisualizationTimeSelect
        minDate={moment.utc('1984-01-01')}
        maxDate={moment.utc()}
        getAndSetNextPrevDate={getAndSetNextPrevDate}
        onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
        showNextPrev={true}
        fromTime={fromTime}
        toTime={toTime}
        updateSelectedTime={(fromTime, toTime) => setState({ fromTime: fromTime, toTime: toTime })}
        timespanSupported={false}
      />
    </WrappedVisualizationTimeSelect>
  );
});

stories.add('Timespan disabled with interval as input', ({ state, setState }) => {
  const fromTime = state.fromTime || moment.utc().subtract(7, 'day').startOf('day');

  const toTime = state.toTime || moment.utc().endOf('day');

  const getAndSetNextPrevDate = async (direction) => {
    await onGetAndSetNextPrevDate(direction, state.toTime, setState);
  };

  return (
    <WrappedVisualizationTimeSelect>
      <VisualizationTimeSelect
        minDate={moment.utc('1984-01-01')}
        maxDate={moment.utc()}
        getAndSetNextPrevDate={getAndSetNextPrevDate}
        onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
        showNextPrev={true}
        fromTime={fromTime}
        toTime={toTime}
        updateSelectedTime={(fromTime, toTime) => setState({ fromTime: fromTime, toTime: toTime })}
        timespanSupported={false}
      />
    </WrappedVisualizationTimeSelect>
  );
});

function onQueryDatesForActiveMonth(date) {
  return new Promise((resolve) => {
    resolve([moment.utc(date).startOf('month').toDate()]);
  });
}

const onGetAndSetNextPrevDate = async (direction, toTime, setState) => {
  const currentDate = toTime ? moment.utc(toTime) : moment.utc();
  const newDate = direction === 'prev' ? currentDate.subtract(1, 'day') : currentDate.add(1, 'day');
  if (newDate.isAfter(moment.utc().endOf('day'))) {
    throw new Error('Unable to select future date');
  }
  setState({
    fromTime: moment.utc(newDate).startOf('day'),
    toTime: moment.utc(newDate).endOf('day'),
  });
};

const WrappedVisualizationTimeSelect = (props) => (
  <Provider store={store}>
    <div style={{ background: '#3b3d4d', height: '50vh' }}>{props.children}</div>
  </Provider>
);
