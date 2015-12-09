module.exports = /*@ngInject*/ function(
  $scope,
  $stateParams,
  $ionicHistory,
  $state,
  $ionicScrollDelegate,
  UserConfig
) {
  var _this = this;

  this.allMeters = UserConfig.allMeters;

  this.meters = {
    electricity: null,
    heat: null,
    production: null
  };

  this.config = UserConfig;

  this.showConsumption = function showConsumption() {
    $ionicHistory.nextViewOptions({
      historyRoot: true
    });

    $state.go('consumption');
  };

  $scope.$on('$ionicView.beforeEnter', function() {
    _this.isFirst = $stateParams.isFirst === '1';

    ['electricity', 'heat', 'production'].forEach(function(type) {
      var meter = UserConfig.meters[type];
      var cachedMeter = _this.meters[type];

      if (meter === null) {
        _this.meters[type] = null;
      } else if (!cachedMeter || cachedMeter._id !== meter._id) {
        _this.meters[type] = UserConfig.getMeter(type, meter._id);
      }
    });
  });

  $scope.$on('$ionicView.afterEnter', function() {
    if (_this.isFirst) {
      $ionicScrollDelegate.resize();
    }
  });
};
