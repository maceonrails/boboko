angular
  .module('eresto.controller', [])
  .controller('AppCtrl', AppCtrl)

function AppCtrl($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, localStorageService, $window, $rootScope, $log, $ionicLoading, $timeout) {
  $scope.username = AuthService.username();
  $scope.name = AuthService.name();
  $scope.$state = $state

  $rootScope.goBack = function() {
    $state.go('main.dashboard')
  };

  $rootScope.refresh = function () {
    $rootScope.init();
    // $state.go($state.current, {}, { reload: true });
    // $log.debug('refresh')
  }

  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };
 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
  	debugger
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });

  // $scope.$on(AUTH_EVENTS.hostNotFound, function(event) {
  //   setHost()
  // });

  $scope.$on(AUTH_EVENTS.badRequest, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Something wrong with server',
      template: 'Please check host or call your administrator.'
    });
  });

  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner> <span class="spinner-text">Loading...</span>',
      animation: 'fade-in',
      showBackdrop: true,
    })
  })

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
  })
 
  $scope.setCurrentUsername = function(name) {
    $scope.name = name;
  };
}