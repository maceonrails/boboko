angular.module('eresto.config', ['restangular', 'LocalStorageModule'])
.config(function(RestangularProvider, localStorageServiceProvider, $httpProvider) {
  RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
    var extractedData;
    // .. to look for getList operations
    if (operation === "getList") {
      // .. and handle the data and meta data
      extractedData = data[what];
      extractedData.total = data.total;
    } else {
      extractedData = data;
    }
    return extractedData;
  });

  var domain = window.location.hostname;
  domain = domain === 'localhost' ? '' : domain;
  localStorageServiceProvider
    .setPrefix('eresto')
    .setStorageType('sessionStorage')
    .setStorageCookieDomain(domain);

  RestangularProvider
    .setBaseUrl('http://localhost:3000/v1');

  $httpProvider.interceptors.push('APIInterceptor');
})
.service('APIInterceptor', function($rootScope, localStorageService, $q, $injector) {
  var service = this;

  service.request = function(config) {
    if(!config.params) {
      config.params = {};
    }
    var token   = null;
    if ($rootScope.token === null || $rootScope.token === undefined){
      token = localStorageService.get('token');
    }else {
      token = $rootScope.token;
    }

    config.params.token = token;
    return config || $q.when(config);
  };

  service.responseError = function(rejection) {
    if (rejection.status === 401) {
      localStorageService.set('token', null);
      return $q.reject(rejection);// return to login page
    } else if (rejection.status === 404) {
      $rootScope.$broadcast('host:show')
      return $q.reject(rejection);
    }
    else {
      return $q.reject(rejection);
    }
  };

  service.response = function(response) {
    var data = response.headers('X-Token');
    if (data){
      localStorageService.set('token', data);
    }

    // set total data
    var total = response.data.total;
    if (total){
      $rootScope.total = total;
    }
    return response;
  };
})