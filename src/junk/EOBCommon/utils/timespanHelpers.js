import moment from 'moment';

//check if date string contains time info
export function isTimeSpecifiedInDate(timeStr) {
  return timeStr.length > 'YYYY-MM-DD '.length;
}

//check if string represents an interval
export function isTimeInterval(dateTimeStr) {
  return dateTimeStr && dateTimeStr.includes('/');
}

function formatTime(timeStr) {
  return moment.utc(timeStr).format(isTimeSpecifiedInDate(timeStr) ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
}

export function formatTimeInterval(timeInterval) {
  if (!isTimeInterval(timeInterval)) {
    return timeInterval;
  }
  const [timeFrom, timeTo] = timeInterval.split('/');
  if (timeFrom === timeTo) {
    return formatTime(timeTo);
  }
  return `${formatTime(timeFrom)} - ${formatTime(timeTo)}`;
}

export function getInstantsFromTimeInterval(time) {
  if (!isTimeInterval(time)) {
    return {
      timeFrom: time,
      timeTo: time,
    };
  }
  const [timeFrom, timeTo] = time.split('/');
  return { timeFrom: timeFrom, timeTo: timeTo };
}
