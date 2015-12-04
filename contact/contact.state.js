module.exports = /*@ngInject*/ function($stateProvider) {
  $stateProvider.state('contact', {
    parent: 'main',
    url: '/contact',
    views: {
      'content': {
        template: require('./contact.tmpl.html'),
        controller: 'ContactController as ctrl'
      }
    }
  });
};
