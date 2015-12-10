var ArrayUtil = require('../shared/array-util.js');

module.exports = /*@ngInject*/ function(
  $rootScope,
  $scope,
  energimolnetAPI,
  appConfig
) {
 var _this = this;
 var unregisterAppResume;

 this.prices = undefined;
 this.view = 0;
 this.max = 0;
 this.hasTomorrowsPrices = false;
 this.loading = false;

 this.getHour = function getHour(index) {
   return ((index < 10) ? '0' : '') + index + '-' +
          ((index < 9) ? '0' : '') + (index + 1);
 };

 function getPrices() {
   var area = appConfig.nordpool.area;

   if (!area) {
     return console.error('No bidding area specified in app config');
   }

   _this.loading = true;

   energimolnetAPI.request({
     method: 'GET',
     url: '/prices/nordpool/' + area + '/threeDays'
   }).then(function(data) {
     var prices = data.prices;

     if (prices) {
       _this.prices = prices;
       _this.max = ArrayUtil.max(prices);

       if (prices.length >= 72) {
         _this.hasTomorrowsPrices = ArrayUtil.sum(prices.slice(48,71)) > 0;
       }
     }
   }).finally(function() {
     _this.loading = false;
   });
 }

 $scope.$on('$ionicView.beforeEnter', function() {
   getPrices();
   unregisterAppResume = $rootScope.$on('mry:appResume', getPrices);
 });

 $scope.$on('$ionicView.afterLeave', function() {
   if (typeof unregisterAppResume === 'function') {
     unregisterAppResume();
     unregisterAppResume = undefined;
   }
 });
};
