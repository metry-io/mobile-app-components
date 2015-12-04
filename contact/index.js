// Contact page module.
// Contact info should be configured in a appConfig angular constant
//
// E.g.
//
// angular.constant('appModule', {
//   version: 1.0,
//   contact: {
//     phone: "+012345678",
//     phoneDisplay: "+012&nbsp;345&nbsp;67-8",
//     mail: "my@mail.com",
//     address: "1 Holiday Road<br>Sunny State<br>12345 Home"
//   }
// });
//
// This module requires the shared module to work.

var MODULE_NAME = 'contact';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [
  require('../shared')
])

.controller('ContactController', require('./contact.ctrl.js'));
