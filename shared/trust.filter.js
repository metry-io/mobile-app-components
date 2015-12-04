module.exports = /*@ngInject*/ function($sce) {
  return function(html) {
    return $sce.trustAsHtml(html);
  };
};
