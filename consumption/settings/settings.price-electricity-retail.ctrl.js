module.exports = /*@ngInject*/ function($scope, $stateParams, emCalculatedMetrics) {
  var _this = this;
  this.loading = true;
  this.periods = [];

  $scope.$on('$ionicView.enter', function() {
    _this.meterId = $stateParams.meterId;
    _this.loading = true;
    _this.periods = [];

    var calcMetrics = emCalculatedMetrics.forMeter(_this.meterId);

    calcMetrics.query().then(function(res) {
      _this.periods = res.data.filter(function(item) {
        return item.key && item.key === 'retail';
      });

      _this.loading = false;
    });
  });
};
