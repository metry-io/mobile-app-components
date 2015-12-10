var UrlUtil = require('./url-util.js');

module.exports = /*@ngInject*/ function($q, emAuth, authConfig) {
  function login() {
    return $q(function(resolve, reject) {
      var url = emAuth.authorizeUrl();
      var browser = window.open(url, '_blank', 'location=yes');
      var foundCode = false;

      browser.addEventListener('loadstart', handleEvent);
      browser.addEventListener('loaderror', handleEvent);

      function handleEvent(event) {
        if (event.url.indexOf(authConfig.redirectUri) === 0) {
          var authCode = UrlUtil.getURLParameter(event.url, 'code');
          foundCode = true;

          browser.close();
          emAuth.handleAuthCode(authCode).then(resolve);
        }
      }

      browser.addEventListener('exit', function() {
        if (!foundCode) {
          reject();
        }
      });
    });
  }

  function logout() {
    emAuth.setRefreshToken(null);
  }

  return {
    login: login,
    logout: logout
  };
};
