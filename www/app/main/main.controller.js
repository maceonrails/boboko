angular
  .module('eresto.main', ['http-auth-interceptor'])
  .controller('MainCtrl', MainCtrl)

function MainCtrl($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, $rootScope, $log, $ionicLoading, $ionicSideMenuDelegate, Restangular) {
  $scope.username = AuthService.username();
  $scope.name = AuthService.name();
  $scope.$state = $state

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
    $rootScope.loadHistoryOrders();
  };

  $rootScope.goBack = function() {
    $state.go('main.dashboard')
  };

  $scope.logout = function() {
    $ionicPopup.confirm({
      title: 'Print rekap',
      template: 'Print out rekap?'
    }).then(function(res) {
      if(res) {
        Restangular.one('users', AuthService.id()).getList('rekap')
      }
      AuthService.logout();
      $state.go('login');
    });
  };
 
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