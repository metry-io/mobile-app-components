var MODULE_NAME = 'consumption';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [
  require('../shared')
])

.service('UserConfig', require('./user-config.service.js'))
.service('ConsumptionSlides', require('./consumption-slides.service.js'))
.service('DateSelectPopup', require('./date-select-popup.service.js'))
.directive('mryConsumptionChart', require('./consumption-chart.directive.js'))
.directive('mryConsumptionCard', require('./consumption-card.directive.js'))
.controller('ConsumptionController', require('./consumption.ctrl.js'));
