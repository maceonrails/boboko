angular.module('eresto.config', ['restangular', 'LocalStorageModule'])
.service('APIInterceptor', APIInterceptor)
.service('AuthInterceptor', AuthInterceptor)
.config(config)

function config(RestangularProvider, localStorageServiceProvider, $httpProvider) {
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

  // $httpProvider.interceptors.push('APIInterceptor');
  $httpProvider.interceptors.push('AuthInterceptor');
}

function AuthInterceptor($rootScope, $q, AUTH_EVENTS, TOKEN_KEY, localStorageService) {
  var service = this
  
  service.responseError = function (response) {
    $rootScope.$broadcast('loading:hide')
    // $rootScope.$broadcast({
    //   400: AUTH_EVENTS.badRequest,
    //   401: AUTH_EVENTS.notAuthenticated,
    //   403: AUTH_EVENTS.notAuthorized,
    //   404: AUTH_EVENTS.badRequest
    // }[response.status], response);
    return $q.reject(response);
  } 
  service.requestError = function(response) {
    $rootScope.$broadcast('loading:hide')
    return $q.reject(response);
  }
  service.request = function(config) {
    $rootScope.$broadcast('loading:show')
    if(!config.params) {
      config.params = {};
    }
    
    config.params.token = localStorageService.get(TOKEN_KEY);
    return config || $q.when(config);
  }
  service.response = function (response) {
    $rootScope.$broadcast('loading:hide')
    return response
  }
}

function APIInterceptor($rootScope, localStorageService, $q, $injector) {
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
}

