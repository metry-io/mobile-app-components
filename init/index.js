/*
 * Init component
 *
 * Apps that need user access to the Metry API should include the init module
 * and create an init state that runs before everything else, to make sure that
 * the user is authenticated and the user's meters are fetched from the API.
 *
 * Also check the client/authentication config of the energimonet-ng npm module
 * for details on how to configure your app's client settings.
 *
 * The module requires two config parameters. The first is the initialState,
 * which is the state the app should transition to when usre is logged in and
 * meters have been fetched. The second parameter is setupFailedState, which
 * should be the name of a state the app should transition to if user logs in
 * and has more than one meter of each kind. Typically this is the settings
 * state, contained in the consumptions/settings module.
 *
 * ModueConfig examle
 * angular.constant('appModule', {
 *   // ...other config here...
 *   init: {
 *     initialState: 'consumptions',
 *     setupFailedState: 'settings'
 *   }
 * });
 */

var MODULE_NAME = 'init';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.factory('mryLoginService', require('./login.service.js'))
.controller('InitController', require('./init.ctrl.js'));
