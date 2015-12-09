module.exports = /*@ngInject*/ function($window) {
  var storage = $window.localStorage || {};

  function getItem(key) {
    var value = storage.getItem(key);

    if (value !== null && (value.charAt(0) === '[' || value.charAt(0) === '{')) {
      return JSON.parse(value);
    }

    return value;
  }

  function setItem(key, value) {
    if (value === null || value === undefined) {
      return storage.removeItem(key);
    }

    var type = typeof value;

    if (type !== 'string' && type !== 'number') {
      value = JSON.stringify(value);
    }

    storage.setItem(key, value);
  }

  function removeItem(key) {
    setItem(key, null);
  }

  return {
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem
  }
};
