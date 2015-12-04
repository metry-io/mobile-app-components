var MODULE_NAME = 'shared';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.filter('mryTrust', require('./trust.filter.js'));
