angular
  .module('eresto.routes', [])
  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('auth', {
        url: "",
        abstract: true,
        templateUrl: "app/auth/auth.html",
        controller: 'AuthCtrl'
      })
      .state('auth.dashboard', {
        url: "/dashboard",
        views: {
          'menuContent' :{
            controller:  "DashboardCtrl",
            templateUrl: "app/dashboard/dashboard.html"              
          }
        }
      })      
      .state('auth.order', {
        url: "/order/:id",
        cache: false,
        views: {
          'menuContent' :{
            templateUrl: "app/order/order.html",
            controller: 'OrderCtrl'
          }
        }
      })

     $urlRouterProvider.otherwise("/dashboard");

  });
