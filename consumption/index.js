/*
 * Consumption module
 * To use this module, your apps need to define states for all settings
 * controllers. See README.settings for more info.
 *
 * To configure what grid owner to use when selecting metric models, you
 * use an angular constant named appConfig (same as all other modules).
 *
 * angular.constant('appModule', {
 *   consumption: {
 *     electricity {
 *       gridModelOwner: '<id or null>',
 *       retailModelOwner: '<id or null>'
 *     },
 *     heat: {
 *      gridModelOwner: '<id or null>'
 *     }
 *   }
 * });
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
