angular.module('eresto', [
  'ionic',
  'eresto.config',
  'eresto.routes',
  'eresto.auth',
  'eresto.login',
  'eresto.dashboard',
  'eresto.order',
  'eresto.tax.service',
  'eresto.order.service',
  'eresto.payment.service',
  'eresto.discount.service',
  'eresto.menu.service',
  'eresto.table.service'
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

  localStorageService.set('company_id', 6969)
});
