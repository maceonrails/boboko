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
    $rootScope.current_user = null
    RestService.all('sessions').post({ user: user }).then(function (data) {
      // $http.defaults.headers.common.Authorization = data.token;  // Step 1
      // A more secure approach would be to store the token in SharedPreferences for Android, and Keychain for iOS
      if (data.role == 'cashier') {

        localStorageService.set('token', data.token);
        RestService.one('users', data.id).get().then(function (data) {
          localStorageService.set('current_user', data.user)
        })
        authService.loginConfirmed(data, function(config) {  // Step 2 & 3
          config.headers.Authorization = data.token;
          return config;
        });
      } else {
        $rootScope.$broadcast('event:auth-login-failed', "Maaf, akses ditolak.");
      }
        
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
    localStorageService.remove('current_user');
    delete $http.defaults.headers.common.Authorization;
    $rootScope.$broadcast('event:auth-logout-complete');
  }

  function loginCancelled() {
    authService.loginCancelled();
  }
}