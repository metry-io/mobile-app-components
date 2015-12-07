var MODULE_NAME = 'shared';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.factory('mryLocalStorage', require('./local-storage.service.js'))
.filter('mryTrust', require('./trust.filter.js'))
.directive('dynabox', require('./dynabox.directive.js'));
