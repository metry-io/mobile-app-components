var MODULE_NAME = 'settings';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.filter('emAverageConsumption', require('./average-consumption.filter.js'))
.service('PriceEditErrorHandler', require('./settings.price-edit-error-handler.service.js'))
.controller('SettingsController', require('./settings.ctrl.js'))
.controller('MetersController', require('./settings-meter.ctrl.js'))
.controller('SettingsPriceHeatController', require('./settings.price-heat.ctrl.js'))
.controller('SettingsPriceElectricityController', require('./settings.price-electricity.ctrl.js'))
.controller('SettingsPriceElectricityRetailController', require('./settings.price-electricity-retail.ctrl.js'))
.controller('SettingsPriceElectricityRetailEditController', require('./settings.price-electricity-retail-edit.ctrl.js'))
.controller('SettingsPriceElectricityGridController', require('./settings.price-electricity-grid.ctrl.js'))
.controller('SettingsPriceElectricityGridEditController', require('./settings.price-electricity-grid-edit.ctrl.js'));
