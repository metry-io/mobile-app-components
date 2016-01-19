module.exports = /*@ngInject*/ function(
  $scope,
  $timeout,
  $state,
  $window,
  $ionicHistory,
  $ionicLoading,
  $ionicPopup,
  emAuth,
  mryLoginService,
  UserConfig,
  appConfig
) {
  var _this = this;
  var showingBrowser = false;
  this.loggedIn = true;

  this.login = function login(url) {
    if (showingBrowser) return;

    showingBrowser = true;
    mryLoginService.login(url).finally(function() {
      showingBrowser = false;
      $timeout(updateState, 10);
    });
  };

  this.createAccount = function createAccount() {
    var authUrl = emAuth.authorizeUrl();
    var url;

   if (appConfig.init && appConfig.init.registrationId) {
     url = 'https://app.metry.io/register/#/' +
           appConfig.init.registrationId +
           '?redirect=';
   } else {
     url = 'https://app.metry.io/register?redirect=';
   }

   url += encodeURIComponent(authUrl);
   _this.login(url);
  };

  this.forgotPassword = function forgotPassword() {
    var url = 'https://app.metry.io/security?force=1#/forgot-password';
    $window.open(url, '_blank');
  };

  $scope.$on('$ionicView.beforeEnter', function() {
    $timeout(updateState, 50);

    $ionicHistory.nextViewOptions({
      historyRoot: true,
      disableAnimate: true
    });
  });

  function updateState() {
    if (emAuth.isAuthenticated()) {
      _this.loggedIn = true;

      $ionicLoading.show({
        hideOnStateChange: true
      });

      UserConfig.autoSetup().then(function(isSetup) {
        if (UserConfig.allMeters.electricity.length + UserConfig.allMeters.heat.length === 0) {
          // User has no meters.
          $ionicPopup.alert({
            title: 'Inga anläggningar',
            template: 'Det finns inga anläggningar kopplade till din användare. Det kan ibland ta några minuter från registrering innan anläggningarna laddats in. Prova att logga in igen om några minuter. Kontakta kundservice om detta problem kvarstår.'
          });
          mryLoginService.logout();
          _this.loggedIn = false;
        } else {
          if (isSetup) {
            $state.go(
              appConfig.init.initialState,
              {},
              {reload: true, notify: true, inherit: false}
            );
          } else {
            $state.go(
              appConfig.init.setupFailedState,
              {isFirst: '1'},
              {
                reload: true,
                notify: true,
                inherit: false
              }
            );
          }
        }

        $ionicLoading.hide();
      });
    } else {
      _this.loggedIn = false;
    }
  }
};
