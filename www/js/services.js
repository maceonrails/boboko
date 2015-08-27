var resource_url = "http://localhost:3000";

angular.module('erestoCashier.services', ['http-auth-interceptor'])
.factory('AuthenticationService', function($rootScope, $http, authService, $httpBackend) {
  var service = {
    login: function(user) {
      $http.post('https://login', { user: user }, { ignoreAuthModule: true })
      .success(function (data, status, headers, config) {
      $http.defaults.headers.common.Authorization = data.authorizationToken;  // Step 1
        // Store the token in SharedPreferences for Android, and Keychain for iOS
        // localStorage is not very secure
        
        // Need to inform the http-auth-interceptor that
        // the user has logged in successfully.  To do this, we pass in a function that
        // will configure the request headers with the authorization token so
        // previously failed requests(aka with status == 401) will be resent with the
        // authorization token placed in the header
        authService.loginConfirmed(data, function(config) {  // Step 2 & 3
          config.headers.Authorization = data.authorizationToken;
          return config;
        });
      })
      .error(function (data, status, headers, config) {
        $rootScope.$broadcast('event:auth-login-failed', status);
      });
    },
    logout: function(user) {
      $http.post('https://logout', {}, { ignoreAuthModule: true })
      .finally(function(data) {
        delete $http.defaults.headers.common.Authorization;
        $rootScope.$broadcast('event:auth-logout-complete');
      });     
    },  
    loginCancelled: function() {
      authService.loginCancelled();
    }
  };
  return service;
})

.factory("Menu", function($resource) {
  return $resource(resource_url + "/categories/:category_id/sub_categories/:sub_category_id/menus/:id.json", 
  	{ 
  		id: "@id", 
  		category_id: "@sub_category.category_id", 
  		sub_category_id: "@sub_category_id" 
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("SubCategory", function($resource) {
  return $resource(resource_url + "/sub_categories/:id.json", 
  	{ 
  		id: "@id", 
  		category_id: "@category_id"
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("Category", function($resource) {
  return $resource(resource_url + "/categories/:id.json", 
  	{ 
  		id: "@id"
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("Choice", function($resource) {
  return $resource(resource_url + "/menus/:menu_id/choices/:id.json", 
  	{ 
  		id: "@id",
  		menu_id: "@menu_id"
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("Table", function($resource) {
  return $resource(resource_url + "/rooms/:room_id/tables/:id.json", 
  	{ 
  		id: "@id",
  		rooms: "@room_id" 
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("Room", function($resource) {
  return $resource(resource_url + "/rooms/:id.json", 
  	{ 
  		id: "@id"
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("Order", function($resource) {
  return $resource(resource_url + "/orders/:id.json", 
  	{ 
  		id: "@id"
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("OrderItem", function($resource) {
  return $resource(resource_url + "/orders/:order_id/order_items/:id.json", 
  	{ 
  		id: "@id",
  		order_id: "@order_id"
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.factory("Payment", function($resource) {
  return $resource(resource_url + "/orders/:order_id/payments/:id.json", 
  	{ 
  		id: "@id",
  		order_id: "@order_id"
  	},
    {
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
})

.service('OrderService', ['Order', function(Order){
	var uid = 1;
	var orders = Order.index();

	this.new = function (order) {
		order = typeof order !== 'undefined' ? order : {};
		order.id = uid++;
		order.status = 'waiting';
		orders.push(order);
	};

	this.create = function (order) {
		return Order.create(order)
	};

	this.get = function (id) {
		for (i in orders) {
			if (orders[i].id == id) return orders[i];
		}
	}

	this.WaitingList = function () {
	}

}])

.service('OrderItemService', ['Order', function(Order){
	var uid = 0;
}])

