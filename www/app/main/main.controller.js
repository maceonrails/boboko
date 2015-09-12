angular
  .module('eresto.app', ['http-auth-interceptor'])
  .controller('AppCtrl', AppCtrl)

function AppCtrl($rootScope, $scope, $state, AuthenticationService, $ionicPopup, localStorageService, $window) {
  $scope.message = "";
  $scope.isLogin = true;
  $scope.user = {
    username: null,
    password: null
  };
  
  $scope.login = function() {
    AuthenticationService.login($scope.user);
  };

  $scope.logout = function () {
    AuthenticationService.logout();
  }

  $scope.$on('event:auth-loginRequired', function(e, rejection) {
    console.log('handling login required');
    $scope.isLogin = false
    $ionicPopup.alert({
      title: 'Warning',
      template: "Login required"
    }).then(function (res) {
      console.log(res);
    })
    // $state.go('auth.login', {}, {reload: true, inherit: false});
  });
  
 
  $scope.$on('event:auth-loginConfirmed', function() {
   $scope.username = null;
   $scope.password = null;
   $scope.isLogin = true;

   $ionicPopup.alert({
      title: 'Success',
      template: "Login Success"
    }).then(function (res) {
      console.log(res);
    })
   // $state.go('auth.dashboard', {}, {reload: true, inherit: false});
  });

  $rootScope.$on('host:show', function () {
    showHostPopup();
  })
  
  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    if (status == 401) {
      error = "Invalid Username or Password.";
    }
    $ionicPopup.alert({
      title: 'Failed',
      template: error
    }).then(function (res) {
      console.log(res);
    })
  });
 
  $scope.$on('event:auth-logout-complete', function() {
    console.log("logout complete");
    $scope.isLogin = false
    $ionicPopup.alert({
      title: 'Success',
      template: "logout complete"
    }).then(function (res) {
      console.log(res);
    })
    // $state.go('auth.login', {}, {reload: true, inherit: false});
  });     
}