var fs = require('fs');

module.exports = /*@ngInject*/ function($stateProvider) {
  $stateProvider.state('contact', {
    parent: 'main',
    url: '/contact',
    views: {
      'content': {
        template: fs.readFileSync(__dirname + '/contact.tmpl.html', 'utf8'),
        controller: 'ContactController as ctrl'
      }
    }
  });
};
