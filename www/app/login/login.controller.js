angular
  .module('eresto.login', ['eresto.authentication.service'])
  .controller('LoginCtrl', LoginCtrl)

function LoginCtrl($scope, $http, $state, localStorageService, $rootScope, AuthService, $ionicPopup, Restangular, $window, $ionicLoading, AUTH_EVENTS, Restangular) {
  $scope.data = {};
  $scope.showLogin = showLogin
  $rootScope.setHost = setHost
  $scope.login = login

  if (AuthService.isAuthenticated) {
    $state.go('main.dashboard');
  }

  function showLogin() {
    $scope.user = {}
    $ionicPopup.show({
      templateUrl: 'app/login/form.html',
      title: 'Bober Cafe',
      scope: $scope,
      buttons: [
        { text: 'Cancel', onTap: function(e) {ionic.Platform.exitApp();} },
        {
          text: '<b>Login</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.user.email || !$scope.user.password) {
              e.preventDefault();
            } else {
              $scope.login($scope.user);
            }
          }
        },
      ]
    });
  }

  function login(data) {
    AuthService.login(data).then(function(authenticated) {
    	$scope.setCurrentUsername(localStorageService.get('name'));
      $state.go('main.dashboard');
    }, function(err) {
      $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      }).then(function (result) {
        showLogin();
      });
    });
  };


  function setHost() {
    $rootScope.host = localStorageService.get('host');
    $ionicPopup.show({
      template: '<label class="item item-input"><input type="text" ng-model="$root.host"></label>',
      title: 'Add host/IP',
      scope: $scope,
      buttons: [
        { text: 'Cancel', onTap: function(e) {ionic.Platform.exitApp();} },
        {
          text: '<b>Update</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$rootScope.host) {
              e.preventDefault();
            } else {
              localStorageService.set('host', $rootScope.host);
              Restangular.setBaseUrl('http://' + $rootScope.host + '/v1')
              checkConnection();
            }
          }
        },
      ]
    })
  }

  var checkConnection = function(){
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Checking connection...</span>'
    });

    Restangular.oneUrl('checkConnection', 'http://'+$rootScope.host+'/v1').get()
      .then(function(){}, function(err){
        if (err.data && err.data.message === 'Oops, its looking like you may have taken a wrong turn.') {
          showLogin();
        } else {
          setHost();
        }
        $ionicLoading.hide();
      });
  };

  if (localStorageService.get('host')){
    $rootScope.host = localStorageService.get('host')
    checkConnection();
  } else {
    setHost();
  }
}