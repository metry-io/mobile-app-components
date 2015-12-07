var fs = require('fs');

var svgNamespace = 'http://www.w3.org/2000/svg';
var PADDING_BETWEEN = 2;
var PADDING_LEFT = 24;
var PADDING_RIGHT = 12;
var CHART_HEIGHT = 200;
var DATE_FORMATS = {
  day: 'HH',
  week: 'EEE dd',
  month: 'dd',
  year: 'MMM'
};

module.exports = /*@ngInject*/ function() {
  return {
    restrict: 'E',
    template: fs.readFileSync(__dirname + '/consumption-chart.directive.tmpl.html', 'utf8'),
    scope: {
      data: '=mryData',
      startDate: '=mryStartDate',
      view: '@mryView',
      max: '@mryMax',
      min: '@mryMin'
    },
    replace: true,
    controllerAs: 'ctrl',
    bindToController: true,
    controller: /*@ngInject*/ function($scope, $element, $timeout, $filter) {
      var _this = this;
      var needsDraw = false;
      var element = $element[0];
      var svg = angular.element(element.getElementsByClassName('mry-chart'));
      var labelsEl = angular.element(element.getElementsByClassName('mry-labels'));

      this.max = parseInt(this.max || 100);
      this.min = parseInt(this.min || 0);

      $scope.$watchGroup(['ctrl.data', 'ctrl.startDate'], function() {
        setNeedsDraw();
      });

      function setNeedsDraw() {
        if (needsDraw) return;

        needsDraw = true;

        $timeout(function() {
          draw();
          needsDraw = false;
        });
      }

      function draw() {
        svg.empty();
        labelsEl.empty();

        if (!_this.data) return;

        var size = {
          width: $element[0].offsetWidth,
          height: CHART_HEIGHT
        };

        var correctedMaxMin = adjustedMaxMin(
          parseInt(_this.max),
          parseInt(_this.min)
        );

        _this.max = correctedMaxMin[0];
        _this.min = correctedMaxMin[1];

        svg.append(makeSVGGrid(4, size));
        labelsEl.append(makeXLabels(size));
        labelsEl.append(makeYLabels(4, size));

        if (_this.min < 0) {
          svg.append(makeSVGZeroLine(_this.max, _this.min, size));
        }

        svg.append(makeSVGBars(_this.data, size));
      }

      function makeSVGBars(data, size) {
        var valueCount = data.length;
        var barWidth = (size.width - (PADDING_LEFT + PADDING_RIGHT)- (valueCount * PADDING_BETWEEN)) / (valueCount || 1);
        var multiplier = size.height / (_this.max - _this.min);

        var group = document.createElementNS(svgNamespace, 'g');

        for (var i = 0, l = valueCount; i < l; i++) {
          var consumptions = data[i];

          for (var type in consumptions) {
            var value = consumptions[type] || 0;
            var offset = 0;

            if (type === 'heat') {
              offset = consumptions.electricity || 0;
            }

            if (type === 'electricity' && _this.min < 0) {
              offset = -consumptions.electricity;
            }

            var rect = document.createElementNS(svgNamespace, 'rect');
            rect.setAttributeNS(null, 'class', type);
            rect.setAttributeNS(null, 'x', PADDING_LEFT + i * (barWidth + PADDING_BETWEEN));
            rect.setAttributeNS(null, 'y', size.height - ((offset + value - _this.min) * multiplier));
            rect.setAttributeNS(null, 'width', Math.max(barWidth, 0));
            rect.setAttributeNS(null, 'height', Math.max(value * multiplier, 0));

            group.appendChild(rect);
          }
        }

        return group;
      }

      function makeSVGGrid(count, size) {
        var yStep = size.height / count;
        var group = document.createElementNS(svgNamespace, 'g');

        for (var i = 0; i <= count; i++) {
          var y = yStep * i;
          var line = document.createElementNS(svgNamespace, 'line');

          line.setAttributeNS(null, 'class', 'gridline');
          line.setAttributeNS(null, 'x1', 0);
          line.setAttributeNS(null, 'x2', size.width);
          line.setAttributeNS(null, 'y1', y);
          line.setAttributeNS(null, 'y2', y);

          group.appendChild(line);
        }

        return group;
      }

      function makeXLabels(size) {
        var view = _this.view;
        var skip = (view === 'day' || view === 'month') ? 2 : 1;
        var count = _this.data.length;
        var barWidth = (size.width - (PADDING_LEFT + PADDING_RIGHT)- (count * PADDING_BETWEEN)) / (count || 1);
        var dateFilter = $filter('date');
        var labelsEl = document.createElement('div');
        labelsEl.setAttribute('class', 'labelsX');

        for (var i = 0; i < count; i += skip) {
          var date = new Date(_this.startDate.getTime());

          if (view === 'day') {
            date.setHours(i);
          } else if (view === 'week' || view === 'month') {
            date.setDate(date.getDate() + i);
          } else if (view === 'year') {
            date.setMonth(date.getMonth() + i);
          }

          var label = document.createElement('div');
          label.setAttribute('class', 'labelX');
          label.style.left = PADDING_LEFT + i * (barWidth + PADDING_BETWEEN) - 0.5 + 'px';
          label.innerText = dateFilter(date, DATE_FORMATS[view]);

          labelsEl.appendChild(label);
        }

        return labelsEl;
      }

      function makeYLabels(count, size) {
        var range = (_this.max - _this.min);
        var yStep = size.height / count;
        var valueStep = range / count;

        var labelsEl = document.createElement('div');
        labelsEl.setAttribute('class', 'labelsY');

        for (var i = 0; i <= count; i++) {
          var label = document.createElement('div');
          var value = _this.max - (i * valueStep);

          if (value < 0) value = -value;

          label.setAttribute('class', 'labelY');
          label.innerText = value.toFixed(0) + ((i === 0) ? ' kWh' : '');
          labelsEl.appendChild(label);
        }

        return labelsEl;
      }

      function makeSVGZeroLine(max, min, size) {
        var multiplier = size.height / (max - min);
        var y = multiplier * max;
        var zeroLine = document.createElementNS(svgNamespace, 'line');

        zeroLine.setAttributeNS(null, 'class', 'gridline');
        zeroLine.setAttributeNS(null, 'x1', 0);
        zeroLine.setAttributeNS(null, 'x2', size.width);
        zeroLine.setAttributeNS(null, 'y1', y);
        zeroLine.setAttributeNS(null, 'y2', y);

        return zeroLine;
      }
    }
  };
};

function adjustedMaxMin(max, min) {
  var roundMax = Math.ceil(max);
  var roundMin = Math.floor(min);
  var divisor = (min < 0) ? 4 : 20;
  var diff = roundMax - roundMin;

  if (diff % divisor === 0) return [roundMax, roundMin];

  var targetDiff = (Math.ceil(diff / divisor) * divisor);
  var diffDelta = targetDiff - diff;
  var targetMax = roundMax + diffDelta;
  var targetMin = roundMin;

  return [targetMax, targetMin];
}
