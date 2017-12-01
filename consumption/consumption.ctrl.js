var fs = require('fs');

var DETAIL_GRANULARITIES = require('./detail-granularities.json');

module.exports = /*@ngInject*/ function(
  $scope,
  $state,
  $timeout,
  $rootScope,
  $ionicModal,
  $ionicScrollDelegate,
  $ionicPlatform,
  DateSelectPopup,
  ConsumptionSlides,
  UserConfig
) {
  var _this = this;
  var slidesCache;
  var unregisterMeters;
  var unregisterAppResume;
  var offsets = {
    day: 0,
    week: 0,
    month: 0,
    year: 0
  };

  this.view = getInitalView();
  this.meters = undefined;
  this.settings = undefined;
  this.hasData = undefined;

  this.setView = function setView(view) {
    _this.view = view;
    reloadData();
  };

  // Dynabox functions
  this.getData = function(index) {
    return (!slidesCache || index > 0) ? null : slidesCache.getSlide(-index, _this.view);
  };

  this.next = function next() {
    $scope.$broadcast('dynabox.next');
  };

  this.previous = function previous() {
    $scope.$broadcast('dynabox.previous');
  };

  this.selectDate = function selectDate() {
    var view = _this.view;
    var offset = offsets[view];
    var date = slidesCache.dateForOffset(-offset, view);
    var bounds = UserConfig.getBoundaries(DETAIL_GRANULARITIES[view]);

    DateSelectPopup.show(date, bounds).then(function(date) {
      if (date) {
        offsets[view] = -slidesCache.offsetForDate(date, view);
        reloadData();
      }
    });
  };

  // Chart functions
  this.getChartMax = function getChartMax(slide) {
    if (!slide) return 0;
    var prodMeter = _this.meters.production;
    var bounds = slide.bounds;

    if (!bounds) return 100;

    return (prodMeter && prodMeter.selected) ? bounds.production.max : bounds.sum.max;
  };

  this.getChartMin = function getChartMin(slide) {
    if (!slide) return 0;
    var prodMeter = _this.meters.production;
    var elMeter = _this.meters.electricity;
    var bounds = slide.bounds;

    if (!bounds) return 0;

    return (prodMeter && prodMeter.selected && elMeter && elMeter.selected) ? -bounds.electricity.max : 0;
  };

  // Lifecycle events
  $scope.$on('$ionicView.afterEnter', function() {
    unregisterMeters = unregisterMeters || $rootScope.$on('mry:selectedMetersChanged', clearAndReloadData);

    unregisterAppResume = unregisterAppResume || $ionicPlatform.on('resume', function() {
      clearAndReloadData();
    });

    clearAndReloadData();
  });

  $scope.$on('$ionicView.afterLeave', function() {
    if (unregisterAppResume) unregisterAppResume();
    if (unregisterMeters) unregisterMeters();

    unregisterAppResume = undefined;
    unregisterMeters = undefined;
  });

  $scope.$on('dynabox.slidechanged', function(event, index, state) {
    offsets[_this.view] = index;
    $ionicScrollDelegate.scrollTop(false);
  });

  // Helper functions
  function getInitalView() {
    var view = 'month';

    UserConfig.forEachSelectedMeter(function(m) {
      if (!m.consumption_stats.energy.day.first) {
        view = 'year';
      }
    });

    return view;
  }

  function clearAndReloadData() {
    UserConfig.loadUserData()
      .then(function (success) {
        if (success) {
          slidesCache = new ConsumptionSlides();
          reloadData();
        } else {
          $timeout(function () {
            $state.go('init')
          }, 200)
        }
      })
  }

  function reloadData() {
    var offset = offsets[_this.view];

    // If there is no data at the offset, reset to 0
    if (offset !== 0 && slidesCache.getSlide(-offset, _this.view) === null) {
      offset = offsets[_this.view] = 0;
    }

    _this.meters = UserConfig.meters;
    _this.settings = UserConfig.settings;
    _this.hasData = (slidesCache.getSlide(0, _this.view) !== null);

    var electricityMeter = _this.meters.electricity;

    $scope.$broadcast('dynabox.goto', offset);
  }
};
