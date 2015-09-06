angular.module('erestoCashier', [
  'ionic',
  'erestoCashier.services', 
  'erestoCashier.controllers',
  'erestoCashier.config'
])

.run(function($rootScope, $ionicPlatform, localStorageService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })
    .state('app.table', {
      url: "/table",
      views: {
        'menuContent' :{
          controller:  "TableCtrl",
          templateUrl: "templates/table.html"              
        }
      }
    })      
    .state('app.order', {
      url: "/order/:id",
      cache: false,
      views: {
        'menuContent' :{
          templateUrl: "templates/order.html",
          controller: 'OrderCtrl'
        }
      }
    })
    .state('app.login', {
      url: "/login",
      views: {
        'menuContent' :{
          controller:  "LoginCtrl",
          templateUrl: "templates/login.html"              
        }
      }
    })    
    .state('app.logout', {
      url: "/logout",
      views: {
         'menuContent' :{
           controller: "LogoutCtrl",
           templateUrl: "templates/table.html"
         }
      } 
    });

   $urlRouterProvider.otherwise("/app/table");

});
