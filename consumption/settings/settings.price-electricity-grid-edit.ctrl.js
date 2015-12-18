module.exports = /*@ngInject*/ function(
  $scope,
  $stateParams,
  $ionicLoading,
  $ionicHistory,
  emMetricModels,
  emCalculatedMetrics,
  emDateUtil,
  PriceEditErrorHandler,
  UserConfig,
  appConfig
) {
  var _this = this;
  this.loading = true;
  var calcMetrics;

  $scope.$on('$ionicView.enter', function() {
    _this.loading = true;

    _this.meterId = $stateParams.meterId;
    _this.calcMetricId = $stateParams.calcMetricId;
    _this.metric = undefined;
    _this.toDateType = 0;
    _this.fromDate = new Date('2013-01-01');
    _this.toDate = undefined;

    calcMetrics = emCalculatedMetrics.forMeter(_this.meterId);

    if (_this.calcMetricId) {
      calcMetrics.get(_this.calcMetricId).then(function(calcMetric) {
        _this.metric = calcMetric;

        var components = _this.metric.period.split('-');

        if (components[0]) {
          _this.fromDate = emDateUtil.getDate(components[0]);
        }

        if (components[1]) {
          _this.toDate = emDateUtil.getDate(components[1]);

          if (_this.toDate) {
            _this.toDateType = 1;
          }
        }

        fetchModels();
      });
    } else {
      _this.metric = {
        metric_model: null
      };

      fetchModels();
    }
  });

  function fetchModels() {
    var holder = (appConfig && appConfig.consumption &&
                  appConfig.consumption.electricity &&
                  appConfig.consumption.electricity.gridModelOwner) ?
                    appConfig.consumption.electricity.gridModelOwner : 'null';

    return emMetricModels.query({
      holder: holder,
      applicable_types: 'electricity',
      group: 'cost',
      key: 'grid'
    }).then(function(res) {
      _this.models = res.data;
      _this.loading = false;
    });
  }

  this.selectModel = function selectModel(model) {
    _this.metric.metric_model = model._id;
  };

  this.save = function save() {
    $ionicLoading.show();

    var from = emDateUtil.getDayPeriod(_this.fromDate);
    var to = _this.toDateType === 1 ? emDateUtil.getDayPeriod(_this.toDate) : '';

    var metric = {
      metric_model: _this.metric.metric_model,
      period: from + '-' + to
    };

    if (_this.metric._id) {
      metric._id = _this.metric._id;
    }

    calcMetrics.save(metric).then(function() {
      UserConfig.fetchAllMeters().then(function() {
        $ionicLoading.hide();
        $ionicHistory.goBack();
      });
    }, function(error) {
      $ionicLoading.hide();
      PriceEditErrorHandler.handleError(error);
    });
  };

  this.deleteMetric = function deleteMetric() {
    $ionicLoading.show();

    calcMetrics.delete(_this.metric._id).then(function() {
      UserConfig.fetchAllMeters();
    }).then(function() {
      $ionicLoading.hide();
      $ionicHistory.goBack();
    });
  };
};
