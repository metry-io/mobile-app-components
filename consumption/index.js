/*
 * Consumption module
 * To use this module, your apps need to define states for all settings
 * controllers. See README.settings for more info.
 *
 */

var MODULE_NAME = 'consumption';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [
  require('../shared'),
  require('./settings')
])

.factory('mryLocalStorage', require('./local-storage.service.js'))
.service('UserConfig', require('./user-config.service.js'))
.service('ConsumptionSlides', require('./consumption-slides.service.js'))
.service('DateSelectPopup', require('./date-select-popup.service.js'))
.directive('dynabox', require('./dynabox.directive.js'))
.directive('mryConsumptionChart', require('./consumption-chart.directive.js'))
.directive('mryConsumptionCard', require('./consumption-card.directive.js'))
.controller('ConsumptionController', require('./consumption.ctrl.js'));
