exports.getURLParameter = function getURLParameter(url, name) {
  var keys  = url.split('?')[1].split('&');

  for (var i = 0; i < keys.length; i++) {
    var values = keys[i].split('=');

    if (values[0] === name) {
      return decodeURIComponent(values[1]);
    }
  }
  return null;
};
