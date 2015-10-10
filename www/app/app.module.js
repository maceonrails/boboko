angular.module('eresto', [
  'ionic',
  'eresto.config',
  'eresto.routes',
  'eresto.constants',
  'eresto.main',
  'eresto.login',
  'eresto.dashboard',
  'eresto.order',
  'eresto.tax.service',
  'eresto.order.service',
  'eresto.payment.service',
  'eresto.discount.service',
  'eresto.menu.service',
  'eresto.table.service',
  'eresto.auth.service',
  'eresto.shared', 
  'jett.ionic.filter.bar'
])

.run(function($rootScope, $ionicPlatform, localStorageService, Restangular) {
  if(!localStorageService.get('host')) localStorageService.set('host', '192.168.1.251')
  Restangular.setBaseUrl('http://' + localStorageService.get('host') + '/v1')
  $ionicPlatform.ready(function() {
    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.alert({
          title: 'Internet Disconnected',
          content: 'The internet is disconnected on your device, please connect to Bober wifi first.'
        })
        .then(function() {
          ionic.Platform.exitApp();
        });
      }
    }
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleLightContent();
    }
  });

})

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS, $ionicLoading) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        // $state.go('$state.current', {}, {reload: true});
        // $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }

  });

});
