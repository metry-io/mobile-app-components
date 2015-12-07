var DATE_FORMATS = {
  day: 'EEE dd MMM yyyy',
  week: 'w yyyy',
  month: 'MMMM yyyy',
  year: 'yyyy'
};
var ArrayUtil = require('../shared/array-util');

var DETAIL_GRANULARITIES = require('./detail-granularities.json');
var ConsumptionDateUtil = require('./date-util.js');

module.exports = /*@ngInject*/ function(
  $rootScope,
  $q,
  emDateUtil,
  emConsumptions,
  $filter,
  UserConfig
) {
  function ConsumptionSlides() {
    this.slideCache = {};
  }

  // Returns a slide for a given offset. Offset is calculated in view units from
  // the last available data. View units are day/week/month/year
  // Slides are returned instantly, but the data is resolved when available
  ConsumptionSlides.prototype.getSlide = function getSlide(offset, view) {
    var date = dateForOffset(offset, view);

    if (offset < 0 || date === null) return null;

    var slide = this._getCachedSlide(offset, view);

    // Fetch details data if not already fetched
    if (!slide.data) {
      updateSlideData(slide, view);
    }

    return slide;
  };

  // Clears the slide cache
  ConsumptionSlides.prototype.clearCache = function clearCache() {
    this.slideCache = {};
  };

  // Get a cached slide. Will create and cache slide if not existing
  ConsumptionSlides.prototype._getCachedSlide = function _getCachedSlide(offset, view) {
    if (this.slideCache[view] && this.slideCache[view][offset]) {
      return this.slideCache[view][offset];
    }

    var date = dateForOffset(offset, view);
    var granularity = DETAIL_GRANULARITIES[view];

    if (date === null) return null;

    var dateFilter = $filter('date');
    var dateString = dateFilter(date, DATE_FORMATS[view]);

    if (view === "week") dateString = 'Vecka ' + dateString;

    var slide = {
      offset: offset,
      isFirst: (dateForOffset(offset + 1, view) === null),
      granularity: granularity,
      date: date,
      dateString: dateString,
      bounds: UserConfig.getBoundaries(granularity),
      data: null,
      allDataMissing: false
    };

    this._cacheSlide(slide, view);

    return slide;
  };

  // Add a slide to the slide cache
  ConsumptionSlides.prototype._cacheSlide = function _cacheSlide(slide, view) {
    if (!this.slideCache[view]) {
      this.slideCache[view] = [];
    }

    this.slideCache[view][slide.offset] = slide;
  };

  ConsumptionSlides.prototype.offsetForDate = function offsetForDate(date, view) {
    var offset = 0;
    var offsetDate = dateForOffset(offset, view);

    while(offsetDate !== null && offsetDate > date) {
      offset++;
      offsetDate = dateForOffset(offset, view);
    }

    return offset;
  };

  ConsumptionSlides.prototype.dateForOffset = dateForOffset;

  // Returns the start date for a view offset x view units from the last available
  // data, or null if date is outside of available data boundaries
  function dateForOffset(offset, view) {
    var granularity = DETAIL_GRANULARITIES[view];
    var bounds = UserConfig.getBoundaries(granularity);
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 1);
    var compareDate = new Date(bounds.sum.first.getTime());

    if (view === 'day') {
      date.setDate(date.getDate() - offset);
    } else if (view === 'week') {
      var weekday = date.getDay() || 7;
      date.setDate(date.getDate() - weekday + 1);
      date.setDate(date.getDate() - (7 * offset));
      compareDate.setDate(compareDate.getDate() - compareDate.getDay() + 1);
    } else if (view === 'month') {
      date.setDate(1);
      date.setMonth(date.getMonth() - offset);
    } else if (view === 'year') {
      date.setMonth(0);
      date.setFullYear(date.getFullYear() - offset);
      compareDate.setDate(1);
      compareDate.setMonth(0);
    }

    return (date < compareDate) ? null : date;
  }

  return ConsumptionSlides;

  function isPricesSet(meter, type) {
    if (type === 'heat') {
      return meter.metrics.indexOf('cost_grid') !== -1;
    } else if (type === 'electricity') {
      return ((meter.metrics.indexOf('cost_grid') !== -1) &&
             (meter.metrics.indexOf('cost_retail') !== -1));
    }

    return false;
  }

  // Fetches slide consumption data from api for all selected meters
  function updateSlideData(slide, view) {
    var granularity = DETAIL_GRANULARITIES[view];
    var periodGranularity = (view === 'week') ? view : granularity;
    var period = emDateUtil.getPeriod(slide.date, periodGranularity);
    var periodEndDate = ConsumptionDateUtil.dateForPeriodEnd(slide.date, view);
    var promises = [];
    var allBounds = UserConfig.getBoundaries(granularity);

    // Containers for summarized data
    var consumption = [];
    var sum = {
      energy: {},
      cost: {}
    };
    var missingData = {};
    var missingDates = {};
    var allDataMissing = true;

    UserConfig.forEachSelectedMeter(function(meter, type) {
      missingData[type] = false;

      var bounds = allBounds[type];
      var pricesSet = isPricesSet(meter, type);
      var metrics = pricesSet ? ['energy', 'cost'] : ['energy'];

      // Don't fetch data if this period is outside of meter's available data
      if (bounds.last === null ||
          bounds.first === null ||
          periodEndDate < bounds.first) return;

      // Set missingData if no recent data available for meter. Data is expected
      // for all user's meters, or they will be revoked
      if (slide.date > bounds.last) {
        missingData[type] = true;
        missingDates[type] = [slide.date];
        return;
      }

      // Checks to see whether current period is first or last (i.e. wheter it's
      // ok with null values at beginning / end)
      var lastPeriod = (bounds.last <= periodEndDate);
      var firstPeriod = (bounds.first >= slide.date);
      var midPeriod = (!lastPeriod && !firstPeriod);

      promises.push(emConsumptions.get(meter._id, granularity, period, metrics).then(function(data) {
        if (data && data.length > 0 && data[0].periods && data[0].periods.length > 0 && data[0].periods[0].energy) {
          var energy = data[0].periods[0].energy;
          var cost = data[0].periods[0].cost;

          sum.energy[type] = ArrayUtil.sum(energy);
          sum.cost[type] = cost ? ArrayUtil.sum(cost) : null;

          for (var i = 0, l = energy.length; i < l; i++) {
            var value = energy[i];

            if (consumption.length <= i) {
              consumption.push({});
            }

            consumption[i][type] = value;
          }

          // Check for missing data.
          // Data is missing:
          // If null in a mid-period,
          // If null in a first period after a value
          // If null in a last period and there are values after
          var nullRanges = ArrayUtil.rangesOfValue(energy, null);

          nullRanges.forEach(function(range) {
            if ((firstPeriod && range[0] !== 0) ||
                (lastPeriod && range[1] !== energy.length - 1) ||
                midPeriod) {
              missingDates[type] = missingDates[type] || [];
              missingData[type] = true;

              for (var i = range[0]; i <= range[1]; i++) {
                var date = ConsumptionDateUtil.dateForIndex(slide.date, i, view);
                missingDates[type].push(date);
              }
            }
          });

          allDataMissing = (nullRanges.length === 1 &&
                            nullRanges[0][0] === 0 &&
                            nullRanges[0][1] === energy.length - 1);
        }
      }));
    });

    return $q.all(promises).then(function() {
      slide.data = consumption;
      slide.sum = sum;
      slide.allDataMissing = allDataMissing;
      slide.missing = missingData;
      slide.missingDates = missingDates;

      return slide;
    });
  }
};
