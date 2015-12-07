exports.dateForPeriodEnd = function dateForPeriodEnd(startDate, view) {
  var endDate = new Date(startDate.getTime());

  endDate.setHours(23);
  endDate.setMinutes(59);
  endDate.setSeconds(59);

  if (view === 'week') {
    endDate.setDate(endDate.getDate() + 7 - endDate.getDay());
  } else if (view === 'month') {
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
  } else if (view === 'year') {
    endDate.setMonth(11);
    endDate.setDate(31);
  }

  return endDate;
};

exports.dateForIndex = function dateForIndex(startDate, index, view) {
  var date = new Date(startDate.getTime());

  if (index === 0) return date;

  if (view === 'day') {
    date.setHours(date.getHours() + index);
  } else if (view === 'week' || view === 'month') {
    date.setDate(date.getDate() + index);
  } else {
    date.setMonth(date.getMonth() + index);
  }

  return date;
};
