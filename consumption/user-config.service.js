var KEY_SAVED_METERS = 'mrySelectedMeters';
var KEY_SETTINGS = 'mryUserSettings';

module.exports = /*@ngInject*/ function(
  $rootScope,
  mryLocalStorage,
  emDateUtil,
  emMe,
  emMeters
) {
  this.reset = function reset() {
    this.me = undefined;
    this.meters = undefined;
    this.allMeters = undefined;
    this._bounds = undefined;
    this.settings = undefined;
  };

  this.reset();

  this.getMeter = function getMeter(type, id) {
    var meterType = (type === 'production') ? 'electricity' : type;
    var matches = this.allMeters[meterType].filter(function(m) { return m._id === id; });

    return matches[0] || null;
  };

  this.setMeter = function setMeter(type, meter, selected) {
    if (meter === null) {
      this.meters[type] = null;
    } else {
      this.meters[type] = this.meters[type] || {};
      if (this.meters[type] === null) {
        this.meters[type] = {selected: false};
      }

      this.meters[type]._id =  meter._id;
      this.setSelected(type, selected);
    }

    this._bounds = undefined;
    _saveMeters(this.me, this.meters);
    $rootScope.$broadcast('mry:metersChanged', this.meters);
  };

  this.setSetting = function setSetting(key, value) {
    this.settings[key] = value;

    _saveSettings(this.me, this.settings);
  };

  // Function to run callback on every meter the user has selected
  this.forEachSelectedMeter = function forEachSelectedMeter(callback) {
    var _this = this;

    ['electricity', 'heat', 'production'].forEach(function(type) {
      var meter = _this.meters[type];

      if (meter && meter.selected) {
        var fullMeter = _this.getMeter(type, meter._id);
        callback(fullMeter, type);
      }
    });
  };

  this.toggleSelected = function toggleSelected(type) {
    this.setSelected(type, !this.isSelected(type));
  };

  this.isSelected = function isSelected(type) {
    return (this.meters[type] && this.meters[type].selected);
  };

  this.setSelected = function setSelected(type, selected) {
    if (!this.meters[type]) return;

    // Prevent deselecting last selected meter
    if (this.meters[type].selected) {
      var otherSelected = false;

      for (var otherType in this.meters) {
        var meter = this.meters[otherType];

        if (otherType !== type && meter && meter.selected) {
          otherSelected = true;
        }
      }

      if (!otherSelected) return;
    }

    this.meters[type].selected = selected;

    // Prevent selecting heat when production is selected
    if (this.meters.production && this.meters.production.selected) {
      if (this.meters.heat) {
        this.meters.heat.selected = false;
      }
    }

    this._bounds = undefined;
    _saveMeters(this.me, this.meters);
    $rootScope.$broadcast('mry:selectedMetersChanged', this.meters);
  };

  // Returns the summarized boundaries for all selected meters
  this.getBoundaries = function getBoundaries(granularity) {
    if (this._bounds && this._bounds.granularity) {
      return this._bounds[granularity];
    }

    if (!this._bounds) {
      this._bounds = {};
    }

    var bounds = {
      sum: {
        first: new Date(),
        last: new Date(0),
        max: 0
      }
    };

    var _this = this;

    this.forEachSelectedMeter(function(meter, type) {
      var stats = meter.consumption_stats.energy[granularity];
      var first = emDateUtil.getDate(stats.first);
      var last = emDateUtil.getDate(stats.last);

      bounds[type] = {
        first: first,
        last: last,
        count: stats.count,
        max: stats.max
      };

      if (first !== null && last !== null) {
        bounds.sum.first = new Date(Math.min(first, bounds.sum.first));
        bounds.sum.last = new Date(Math.max(last, bounds.sum.last));
        bounds.sum.max += stats.max;
      }
    });

    this._bounds[granularity] = bounds;

    return bounds;
  };

  this.autoSetup = function autoSetup() {
    var _this = this;

    return emMe.get().then(function(me) {
      _this.me = me;

      _this.meters = _loadMeters(me) || {
        electricity: null,
        heat: null,
        production: null
      };

      _this.settings = _loadSettings(me) || {};
    }).then(function() {
      return _this.fetchAllMeters();
    }).then(function(res) {
      var ids = res.data.map(function(meter) { return meter._id; });

      // Delete a set meter if it is not among current meters
      ['electricity', 'production', 'heat'].forEach(function(type) {
        var meter = _this.meters[type];

        if (meter && ids.indexOf(meter._id) < 0) {
          _this.meters[type] = null;
        }
      });

      _saveMeters(_this.me, _this.meters);

      // Auto setup meters for each type if not already set
      var success = true;

      ['electricity', 'heat'].forEach(function(type) {
        var meter = _this.meters[type];

        if (!meter) {
          var typeCount = 0;
          var firstMeter = null;

          res.data.forEach(function(meter) {
            if (meter.type === type) {
              typeCount++;
              firstMeter = firstMeter || meter;
            }
          });

          _this.setMeter(type, firstMeter, true);

          if (typeCount > 1) {
            success = false;
          }
        }
      });

      return success;
    });
  };

  this.fetchAllMeters = function fetchAllMeters() {
    var _this = this;

    return emMeters.query({
      limit: 100,
      active: true,
      revoked: false
    }).then(function(res) {
      _this.allMeters = {
        electricity: res.data.filter(function(m) {return m.type === 'electricity'; }),
        heat: res.data.filter(function(m) { return m.type === 'heat'; })
      };

      return res;
    });
  };

  function _loadMeters(user) { return _load(KEY_SAVED_METERS, user); }
  function _saveMeters(user, meters) { return _save(KEY_SAVED_METERS, user, meters); }
  function _loadSettings(user) { return _load(KEY_SETTINGS, user); }
  function _saveSettings(user, settings) { return _save(KEY_SETTINGS, user, settings); }

  function _load(keyPrefix, user) {
    return mryLocalStorage.getItem(keyPrefix + '_' + user._id);
  }

  function _save(keyPrefix, user, value) {
    mryLocalStorage.setItem(keyPrefix + '_' + user._id, value);
  }
};
