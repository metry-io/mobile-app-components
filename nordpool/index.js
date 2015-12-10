/*
 * Nordpool spot prices component
 * 
 * Configure the nordpool bidding area in the appConfig constant.
 * The bidding areas are SE1, SE2, SE3, SE4.
 * Area map can be found on:
 * http://www.nordpoolspot.com/maps/#/nordic
 *
 * Config examle
 * angular.constant('appModule', {
 *   // ...other config here...
 *   nordpoolArea: 'SE1'
 * });
 */

var MODULE_NAME = 'nordpool';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.controller('NordPoolController', require('./nordpool.ctrl.js'));
