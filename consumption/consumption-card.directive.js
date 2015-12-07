var fs = require('fs');

module.exports = /*@ngInject*/ function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      headerText: '@mryHeaderText',
      value: '=mryValue',
      valueNullText: '@mryValueNullText',
      valueUnit: '@mryValueUnit',
      uiSref: '@mrySref',
      iconClass: '@mryIconClass'
    },
    bindToController: true,
    controllerAs: 'ctrl',
    controller: /*@ngInject*/ function() {},
    template: fs.readFileSync(__dirname + '/consumption-card.directive.tmpl.html', 'utf8')
  };
};
