angular
  .module('eresto.routes', ['eresto.constants'])
  .config(function($stateProvider, $urlRouterProvider, USER_ROLES) {

    $stateProvider
      .state('main', {
        url: "",
        abstract: true,
        cache: false,
        templateUrl: "app/main/main.html",
      })
      .state('main.dashboard', {
        url: "/dashboard",
        cache: false,
        resolve: {
          tables: function (TableService) {
            return TableService.getAll().then(function (tables) {
              return _.groupBy(tables, 'location');
            });
          },
          orders: function (OrderService) {
            return OrderService.getWaitingOrders().then(function (orders) {
              return orders;
            });
          }
        },
        views: {
          'mainContent' :{
            controller:  "DashboardCtrl",
            templateUrl: "app/dashboard/dashboard.html"              
          }
        },
        data: {
          authorizedRoles: [USER_ROLES.cashier]
        }
      })      
      .state('main.order', {
        url: "/order/:id",
        cache: false,
        views: {
          'mainContent' :{
            templateUrl: "app/order/order.html",
            controller: 'OrderCtrl'
          }
        },
        data: {
          authorizedRoles: [USER_ROLES.cashier]
        }
      })
      .state('login', {
        url: "/login",
        cache: false,
        templateUrl: "app/login/login.html",
        controller: 'LoginCtrl'
      })

    $urlRouterProvider.otherwise('/login');

  });
