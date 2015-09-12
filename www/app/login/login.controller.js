angular
	.module('eresto.login', ['eresto.authentication.service'])
	.controller('LoginCtrl', LoginCtrl)

function LoginCtrl($scope, $http, $state, localStorageService, $rootScope, AuthService, $ionicPopup) {
  $scope.data = {};

  if (AuthService.isAuthenticated) {
    $state.go('main.dashboard');
  }

  $scope.login = function(data) {
    AuthService.login(data).then(function(authenticated) {
      $state.go('main.dashboard', {}, {reload: true});
      $scope.setCurrentUsername(localStorageService.get('name'));
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
}