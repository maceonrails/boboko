angular
	.module('eresto.login', ['eresto.authentication.service'])
	.controller('LoginCtrl', LoginCtrl)

function LoginCtrl($scope, $http, $state, AuthenticationService, localStorageService) {
  $scope.message = "";
  localStorageService.remove('token');
  $scope.user = {
    username: null,
    password: null
  };
 
  $scope.login = function() {
    AuthenticationService.login($scope.user);
  };
}