module.exports = /*@ngInject*/ function(
  $scope,
  $http,
  $window,
  appConfig
) {
  var _this = this;

  this.firstLoading = true;
  this.entries = undefined;
  this.config = appConfig.news;

  this.loadEntries = function loadEntries() {
    var url = 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=-1&callback=JSON_CALLBACK&q=' + encodeURIComponent(_this.config.feedUrl);
    $http.jsonp(url).then(function(res) {
      _this.entries = extractEntries(res.data, _this.config.entriesKey);
    }).finally(function() {
      _this.firstLoading = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  this.selectEntry = function selectEntry(entry) {
    $window.open(entry[_this.config.linkKey], '_blank', 'location=yes');
  };

  this.loadEntries();

  function extractEntries(response, key) {
    if (!key) return [];

    var path = key.split('.');
    var entries = response;

    for (var i = 0, l = path.length; i < l; i++) {
      entries = entries[path[i]];
      if (!entries) return [];
    }

    return entries;
  }
};
