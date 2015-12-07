module.exports = /*@ngInject*/ function($ionicPopup, $rootScope) {
  function show(initialDate, bounds) {
    var scope = $rootScope.$new(false);
    var minDate = bounds.sum.first;
    var maxDate = bounds.sum.last;

    scope.data = {
      date: initialDate,
      minDate: minDate,
      maxDate: maxDate,
      dateChanged: function() {
        if (scope.data.date < minDate) {
          scope.data.date = minDate;
        } else if (scope.data.date > maxDate) {
          scope.data.date = maxDate;
        }
      }
    };

    var popup = $ionicPopup.show({
      template: '<input type="date" ng-model="data.date" style="-webkit-appearance: none; padding: 7px" ng-change="data.dateChanged()">',
      title: 'Välj datum att visa',
      scope: scope,
      buttons: [
        {text: 'Avbryt'},
        {
          text: 'Välj' ,
          type: 'button-positive',
          onTap: function(e) {
            if (!scope.data.date) {
              e.preventDefault();
            } else {
              var date = scope.data.date;
              date.setHours(0, 0, 0, 0);
              return date;
            }
          }
        }
      ]
    });

    return popup;
  }

  return {
    show: show
  };
};
