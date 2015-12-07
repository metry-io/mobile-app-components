exports.sum = function sumArray(array) {
  var sum = 0;

  for (var i = 0, l = array.length; i < l; i++) {
    var value = array[i];
    sum += (value === null) ? 0 : value;
  }

  return sum;
};

exports.max = function maxArray(array) {
  var max = Number.NEGATIVE_INFINITY;

  for (var i = 0, l = array.length; i < l; i++) {
    var value = array[i];

    if (typeof value === 'number' && value > max) {
      max = value;
    }
  }

  return max;
};

exports.min = function minArray(array) {
  var min = Number.POSITIVE_INFINITY;

  for (var i = 0, l = array.length; i < l; i++) {
    var value = array[i];

    if (typeof value === 'number' && value < min) {
      min = value;
    }
  }

  return min;
};

exports.isNullArray = function isNullArray(array) {
  for (var i = 0, l = array.length; i < l; i++) {
    if (array[i] !== null) {
      return false;
    }
  }

  return true;
};

// Returns array of arrays with index pairs with matching start and end indices
// of the sought value
exports.rangesOfValue = function rangesOfValue(array, searchValue) {
  var ranges = [];
  var range;

  for (var i = 0, l = array.length; i < l; i++) {
    var value = array[i];

    if (value === searchValue) {
      if (!range) {
        range = [i, null];
      }
    } else {
      if (range) {
        range[1] = i - 1;
        ranges.push(range);
        range = null;
      }
    }
  }

  // Close final range
  if (range) {
    range[1] = array.length - 1;
    ranges.push(range);
  }

  return ranges;
};
