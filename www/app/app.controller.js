angular
  .module('eresto.controller', [])
  .controller('AppCtrl', AppCtrl)

function AppCtrl($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, localStorageService, $window, $rootScope, $log, $ionicHistory) {
  $scope.username = AuthService.username();
  $scope.name = AuthService.name();
  $scope.$state = $state

  $scope.goBack = function() {
    $state.go('main.dashboard')
  };

  $scope.refresh = function () {
    $rootScope.init();
    // $state.go($state.current, {}, { reload: true });
    // $log.debug('refresh')
  }

  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };

  $rootScope.setHost = setHost

  function setHost() {
    $scope.host = {};
    $scope.host.target = localStorageService.get('host');

    $ionicPopup.show({
      template: '<input type="text" ng-model="host.target">',
      title: 'Add host target',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Update</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.host.target) {
              e.preventDefault();
            } else {
              localStorageService.set('host', $scope.host.target);
              $window.location.reload(true)
            }
          }
        },
      ]
    })
  }
 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
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
 
  $scope.setCurrentUsername = function(name) {
    $scope.name = name;
  };
}