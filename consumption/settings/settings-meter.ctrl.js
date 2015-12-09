module.exports = /*@ngInject*/ function(
  $stateParams,
  $scope,
  UserConfig
) {
  var _this = this;
  var selectType = $stateParams.type;
  var meterType = (selectType === 'production') ? 'electricity' : selectType;

  this.meters = UserConfig.allMeters[meterType];
  this.meter = UserConfig.meters[selectType];
  this.allowSelectNone = (selectType !== meterType);

  this.selectMeter = function selectMeter(meter) {
    UserConfig.setMeter(selectType, meter, true);
    _this.meter = UserConfig.meters[selectType];
  };

  this.refresh = function refresh() {
    UserConfig.fetchAllMeters().then(function() {
      _this.meters = UserConfig.allMeters[meterType];
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
};
