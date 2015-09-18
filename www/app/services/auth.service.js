angular
  .module('eresto.auth.service', ['http-auth-interceptor', 'LocalStorageModule'])
  .service('AuthService', AuthService)

function AuthService($q, $http, USER_ROLES, localStorageService, Restangular, TOKEN_KEY) {
  var username = '';
  var name = '';
  var id = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;

  function loadUserCredentials() {
    var token = localStorageService.get(TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(data) {
    localStorageService.set(TOKEN_KEY, data.token);
    localStorageService.set('name', data.name);
    localStorageService.set('role', data.role);
    localStorageService.set('id', data.id);
    useCredentials(data.token)
  }

  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;
    role = localStorageService.get('role');
    name = localStorageService.get('name');
    id = localStorageService.get('id');
    // Set the token as header for your requests!
    // $http.defaults.headers.common['X-Auth-Token'] = authToken;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    localStorageService.remove(TOKEN_KEY);
  }

  var login = function(user) {
    return $q(function(resolve, reject) {
      if (user.email && user.password) {
        // Make a request and receive your auth token from your server
        Restangular.all('sessions').post({ user: user }).then(function (data) {
          // $http.defaults.headers.common.Authorization = data.token;  // Step 1
          // A more secure approach would be to store the token in SharedPreferences for Android, and Keychain for iOS
          if (data.role == 'cashier') {
            storeUserCredentials(data);
            resolve('Login success.');
          } else {
            reject('Sorry you not authorize to use cashier app.');
          }
        }, function (data) {
          reject('Login failed. Wrong username or password.');
        });
        
      } else {
        reject('Login Failed. Please input username and password.');
      }
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  var authorizeUser = function(user) {
    return Restangular.all('users').customPOST(user, 'authorize_for_discount')
  }

  return {
    login: login,
    logout: logout,
    authorizeUser: authorizeUser,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    name: function() {return name;},
    role: function() {return role;},
    id: function() {return id;}
  };
}

