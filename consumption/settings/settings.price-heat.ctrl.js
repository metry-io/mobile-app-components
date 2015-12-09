module.exports = /*@ngInject*/ function(
  $scope,
  $ionicLoading,
  $stateParams,
  emMeters,
  emMetricModels,
  emCalculatedMetrics,
  UserConfig
) {
  var _this = this;
  var calcMetrics = emCalculatedMetrics.forMeter($stateParams.meterId);

  this.loading = true;

  $scope.$on('$ionicView.enter', function() {
    _this.meterId = $stateParams.meterId;
    _this.models = undefined;
    _this.loading = true;

    calcMetrics.query().then(function(res) {
      var metrics = filterCalcMetrics(res.data);

      _this.modelId = metrics[0] ? metrics[0].metric_model : undefined;

      emMeters.get(_this.meterId).then(function(meter) {
        return emMetricModels.query({
          holder: meter.root.holder._id,
          applicable_types: 'heat',
          group: 'cost',
          key: 'grid'
        });
      }).then(function(res) {
        _this.models = res.data;
      }).finally(function() {
        _this.loading = false;
      });
    });
  });

  this.selectModel = function selectModel(model) {
    $ionicLoading.show();
    // Clear any old calculated metrics for cost
    calcMetrics.query().then(function(res) {
      var metrics = filterCalcMetrics(res.data);

      if (metrics.length > 0) {
        var deleteCount = 0;

        metrics.forEach(function(oldModel) {
          calcMetrics.delete(oldModel._id).then(function() {
            deleteCount++;

            if (deleteCount === metrics.length) {
              applyModel(model);
            }
          });
        });
      } else {
        applyModel(model);
      }
    });
  };

  function applyModel(model) {
    // Apply selected model
    calcMetrics.save({
      metric_model: model._id,
      period: '2012-'
    }).then(function(calcMetric) {
     _this.modelId = calcMetric.metric_model;
      UserConfig.fetchAllMeters().then(function() {
        $ionicLoading.hide();
      });
    });
  }

  function filterCalcMetrics(data) {
    return data.filter(function(item) {
      return item.key && item.key === 'grid';
    });
  }
};
