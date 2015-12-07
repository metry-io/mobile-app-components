var TEMPLATE_TAG = 'slide-template';
var FLICK_TIME_THRESHOLD = 250;
var FLICK_X_THRESHOLD = 20;
var ANIMATION_TIME = 300;

module.exports = /*@ngInject*/ function() {
  return {
    restrict: 'E',
    scope: {
      getData: '&',
      slideScope: '='
    },
    controllerAs: 'dynaboxCtrl',
    bindToController: true,
    compile: function(tElement, tAttrs) {
      var contentEl = tElement.find(TEMPLATE_TAG).eq(0).children().clone();
      var template = angular.element('<slide></slide>');
      template.attr(contentEl.attr());
      template.append(contentEl);

      tElement.empty();

      return function(scope, iElement, iAttrs, ctrl) {
        var index = parseInt(iAttrs.initialIndex || 0);
        ctrl.init(template, index);
      };
    },
    controller: /*@ngInject*/ function($scope, $element, $compile, $timeout, $ionicScrollDelegate) {
      var _this = this;
      var scrollFrozen = false;
      var animating = false;

      this.init = function init(template, initialIndex) {
        _this.unlisteners = [];
        _this.currentEvent = null;

        _this.state = {
          index: null,
          hasPrevious: false,
          hasNext: false
        };

        _this.slides = [];

        // Add slide elements
        for (var i = 0; i < 3; i++) {
        var scope = $scope.$new(true);
          var el = $compile(template.clone())(scope, function(newEl, scope) {
            if (typeof _this.slideScope === 'object') {
              for (var key in _this.slideScope) {
                scope[key] = _this.slideScope[key];
              }
            }

            $element.append(newEl);
          });

          _this.slides.push({
            data: null,
            el: el,
            index: null,
            scope: scope
          });
        }

        resize();
        $element.on('touchstart', touchStart);
        $element.on('resize', resize);

        setIndex(initialIndex);
      };


      $scope.$on('$destroy', function() {
        $element.off('touchstart', touchStart);
      });

      // Listen to events that control dynabox
      $scope.$on('dynabox.update', function() {
        $timeout(function() {
          clearIndices();
          updateData();
        });
      });

      $scope.$on('dynabox.next', function() {
        $timeout(function() {
          slide(1);
        });
      });

      $scope.$on('dynabox.previous', function() {
        $timeout(function() {
          slide(-1);
        });
      });

      $scope.$on('dynabox.goto', function(event, index) {
        $timeout(function() {
          clearIndices();
          setIndex(index);
        });
      });

      function resize() {
        var domEl = $element[0];
        _this.size = domEl.getBoundingClientRect();
      }

      function makePoint(touch) {
        return {x: touch.pageX, y: touch.pageY};
      }

      // Creates an empty event
      function newEvent(touchEvent) {
        return {
          delta: null,
          unlisteners: [],
          start: makePoint(event.touches[0]),
          timestamp: event.timeStamp
        };
      }

      function touchStart(event) {
        if (animating) return;

        _this.currentEvent = newEvent(event);

        $element.on('touchmove', touchMove);
        $element.on('touchend', touchEnd);
      }

      function touchMove(event) {
        var currentEvent = _this.currentEvent;

        // Ignore this event if event is ignored or is user uses more than one finger
        if (!currentEvent || event.touches.length > 1) return;

        var point = makePoint(event.touches[0]);
        var delta = {
          x: point.x - currentEvent.start.x,
          y: point.y - currentEvent.start.y
        };

        // Cancel tracking if user scrolls vertically
        if (!currentEvent.delta && Math.abs(delta.x) < Math.abs(delta.y)) {
          _this.currentEvent = null;
          $element.off('touchmove', touchMove);
          $element.off('touchend', touchEnd);
           return;
         } else {
           freezeScrolling(true);
         }

         currentEvent.delta = delta;
         event.preventDefault();
         event.stopPropagation();

         // Calculate translation. Translate less at ends to create rubber-band
         // effect
         var state = _this.state;
         var factor = ((delta.x > 0 && !state.hasPrevious) ||
                       (delta.x < 0 && !state.hasNext)) ? 1 / (Math.abs(delta.x) / _this.size.width + 1) : 1;
         translateSlides(delta.x * factor, 0);
      }

      function touchEnd(event) {
        var currentEvent = _this.currentEvent;

        if (!currentEvent) return;

        $element.off('touchmove', touchMove);
        $element.off('touchend', touchEnd);
        _this.currentEvent = null;

        var duration = (event.timeStamp - currentEvent.timestamp);
        var delta = currentEvent.delta;

        if (!delta) return;

        var state = _this.state;
        var width = _this.size.width;
        var absDelta = Math.abs(delta.x);
        var isFlick = (duration < FLICK_TIME_THRESHOLD &&
                       absDelta > FLICK_X_THRESHOLD);
        var isDrag = absDelta > width / 2;
        var isWithinBounds = !(!state.hasPrevious && delta.x > 0 ||
                              (!state.hasNext && delta.x < 0));
        var direction = delta.x > 0 ? -1 : 1;

        if ((isFlick || isDrag) && isWithinBounds) {
          // Animate to next/previous slide
          slide(direction);
        } else {
          // Animate back to zero
          translateSlides(0, ANIMATION_TIME);
        }

        freezeScrolling(false);
      }

      function freezeScrolling(freeze) {
        if (freeze !== scrollFrozen) {
          $ionicScrollDelegate.freezeAllScrolls(freeze);
          scrollFrozen = freeze;
        }
      }

      // Slides one slide in the specified direction (> 0 forward, < 0 backward)
      function slide(direction) {
        animating = true;
        var width = _this.size.width;

        $element.on('transitionend', function() {
          animating = false;
          $element.off('transitionend');
          setIndex(_this.state.index + direction);
        });

        translateSlides(-direction * width, ANIMATION_TIME);
      }

      function translateSlides(delta, duration) {
        for (var i = 0, l = _this.slides.length; i < l; i++) {
          var slide = _this.slides[i];
          var transform = 'translate3d(' + delta + 'px,0,0)';
          var transitionDuration  = duration + 'ms';

          slide.el.css({
            transform: transform,
            webkitTransform: transform,
            msTransform: transform,
            MozTransform: transform,
            OTransform: transform,
            transitionDuration: transitionDuration,
            webkitTransitionDuration: transitionDuration,
            msTransitionDuration: transitionDuration,
            MozTransitionDuration: transitionDuration,
            OTransitionDuration: transitionDuration
          });
        }
      }

      function clearIndices() {
        // Removes indexes from cached slides, causing reload of data
        for (var i = 0, l = _this.slides.length; i < l; i++) {
          _this.slides[i].index = null;
        }
      }

      function setIndex(newIndex) {
        _this.state.index = newIndex;
        updateData();
        $scope.$emit('dynabox.slidechanged', _this.state.index, _this.state);
      }

      function updateData() {
        var currentSlides = _this.slides;
        var newSlides = [null, null, null];

        // Reuse old slides
        for (var i = 0; i < 3; i++) {
          var index = _this.state.index - 1 + i;

          for (var j = 0, l = currentSlides.length; j < l; j++) {
            var currentSlide = currentSlides[j];

            if (currentSlide.index === index) {
              newSlides[i] = currentSlides.splice(j, 1)[0];
              break;
            }
          }
        }

        // Apply new data to changed slides
        for (var i = 0; i < 3; i++) {
          var slide = newSlides[i];

          if (slide === null) {
            var index = _this.state.index - 1 + i;
            var reusedSlide = currentSlides.pop();
            var data = _this.getData({$index: index});

            reusedSlide.data = data;
            reusedSlide.index = index;

            newSlides[i] = reusedSlide;
          }
        }

        // Position slides
        for (var i = 0; i < 3; i++) {
          var slide = newSlides[i];
          var transform = 'translate3d(0,0,0)';
          var transitionDuration = '0ms';

          slide.el.css({
            left: _this.size.width * (i - 1) +'px',
            transform: transform,
            webkitTransform: transform,
            msTransform: transform,
            MozTransform: transform,
            OTransform: transform,
            transitionDuration: transitionDuration,
            webkitTransitionDuration: transitionDuration,
            msTransitionDuration: transitionDuration,
            MozTransitionDuration: transitionDuration,
            OTransitionDuration: transitionDuration,
            visibility: (slide.data !== null) ? 'visible' : 'hidden'
          });
        }

        // Apply data to scopes
        $timeout(function() {
          for (var i = 0; i < 3; i++) {
            var slide = newSlides[i];
            slide.scope.data = slide.data;
          }
        });

        // Update whether there are previous/more slides
        _this.state.hasPrevious = (newSlides[0].data !== null);
        _this.state.hasNext = (newSlides[2].data !== null);

        _this.slides = newSlides;
      }
    }
  };
};
