angular
  .module('eresto.authentication.service', ['http-auth-interceptor', 'LocalStorageModule'])
  .factory('AuthenticationService', AuthenticationService)

function AuthenticationService($rootScope, $http, authService, localStorageService, RestService) {
  return {
    login: login,
    logout: logout,
    loginCancelled: loginCancelled
  }

  function login(user) {
    RestService.all('sessions').post({ user: user }).then(function (data) {
      // $http.defaults.headers.common.Authorization = data.token;  // Step 1
      // A more secure approach would be to store the token in SharedPreferences for Android, and Keychain for iOS
      localStorageService.set('token', data.token);
        
      // Need to inform the http-auth-interceptor that
        // the user has logged in successfully.  To do this, we pass in a function that
        // will configure the request headers with the authorization token so
        // previously failed requests(aka with status == 401) will be resent with the
        // authorization token placed in the header
        authService.loginConfirmed(data, function(config) {  // Step 2 & 3
          config.headers.Authorization = data.token;
          return config;
        });
    }, function (data) {
      $rootScope.$broadcast('event:auth-login-failed', data.status);
    });
  }

  function authorizeUser (user) {
    return RestService.all('sessions').post({ user: user }).then(function (data) {
      if (_.includes(["eresto", "owner", "superadmin", "manager", "assistant_manager", "captain"], data.role)) {
        return data.id;
      } else {
        return false
      }
    }, function (data) {
      return false;
    })
  }

  function logout() {
    localStorageService.remove('token');
    delete $http.defaults.headers.common.Authorization;
    $rootScope.$broadcast('event:auth-logout-complete');
  }

  function loginCancelled() {
    authService.loginCancelled();
  }
}