angular.module('erestoCashier', ['ionic', 'ngResource', 'erestoCashier.services', 'erestoCashier.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    $ionicModal.fromTemplateUrl('templates/login.html', function(modal) {
        $scope.loginModal = modal;
      },
      {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }
    );
  //Be sure to cleanup the modal by removing it from the DOM
    $scope.$on('$destroy', function() {
      $scope.loginModal.remove();
    });
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "templates/home.html",
      controller: 'HomeCtrl'
    })
    .state('order', {
      url: "/order/:id",
      templateUrl: "templates/order.html",
      controller: 'OrderCtrl'
    });

   $urlRouterProvider.otherwise("/home");

});
