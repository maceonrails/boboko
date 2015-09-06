angular
  .module('erestoCashier.services', ['http-auth-interceptor', 'restangular', 'LocalStorageModule'])
  .factory('RestService', RestService)
  .factory('AuthenticationService', AuthenticationService)
  .factory('TableService', TableService)
  .factory('OrderService', OrderService)
  .factory('OrderItemService', OrderItemService)
  .factory('CategoryService', CategoryService)
  .factory('DiscountService', DiscountService)
  .factory('TaxService', TaxService)



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

  function logout(user) {
    RestService.all('sessions').post()
    .finally(function(data) {
      localStorageService.remove('token');
      delete $http.defaults.headers.common.Authorization;
      $rootScope.$broadcast('event:auth-logout-complete');
    });     
  }

  function loginCancelled() {
    authService.loginCancelled();
  }
}

function TableService(RestService){
  var base = RestService.all('tables');
  return {
    getAll: getAll,
  }

  function getAll() {
    return base.getList().then(function (tables) {
      return tables;
    })
  }
}

function UserService(RestService){
  return RestService.service('users')
}

function OrderService(RestService, Tax){
  var base = RestService.all('orders');
  return {
    getWaitingOrders: getWaitingOrders,
    create: create,
    find: find,
    getSubTotal: getSubTotal
    createOrderItems: createOrderItems
  }

  function getWaitingOrders () {
    return base.getList({waiting: true}).then(function (orders) {
      return orders;
    })
  }

  function create(order) {
    return base.post({order: order}).then(function (order) {
      return order;
    });
  }

  function find(id) {
    return base.get(id).then(function (order) {
      return order;
    }, function (error) {
      return error;
    });
  }

  function getSubTotal (orderItems) {
    var subTotal = 0
    orderItems.forEach(function(orderItem) {
      subTotal += orderItem.quantity * orderItem.product.price;
    })
    return subTotal
  }

  function getTotal (orderItems) {
    getSubTotal(orderItems) + TaxService.
  }

  function createOrderItems (orderItems) {
    orderItems.forEach(function (orderItem) {
      base.post('order_items', orderItem).then(function (orderItem) {
        return OrderItem;
      })
    })
  }
}

function OrderItemService(RestService){
  var base = RestService.all('order_items');
  return {
    getAllByOrder: getAllByOrder,
    create: create,
    bulkCreate: bulkCreate,
    find: find
  }

  function getAllByOrder (order) {
    return base.getList({order_id: order.id}).then(function (orderItems) {
      return orderItems;
    })
  }

  function create (orderItem) {
    return base.post({order_item: orderItem}).then(function (orderItem) {
      return OrderItem;
    })
  }

  function bulkCreate (orderItems) {
    orderItems.forEach(function (orderItem) {
      create(orderItem);
    })
  }

  function find(id) {
    return base.get(id).then(function (orderItem) {
      return orderItem;
    }, function (error) {
      return error;
    });
  }
}

function PaymentService(RestService){
  return RestService.service('payments')
}

function CategoryService(RestService){
  var base = RestService.all('product_categories')
  return {
    getAll: getAll
  }

  function getAll () {
    return base.getList().then(function (categories) {
      return categories;
    })
  }
}

function SubCategoryService(RestService){
  return RestService.service('product_sub_categories')
}

function ProductService(RestService){
  return RestService.service('products')
}

function DiscountService(RestService){
  return RestService.service('discounts')
}

function TaxService(){
  var taxes = {
    'ppn': 0.1,
    'service': 0.1
  };

  return {
    getTotalRate: getTotalRate,
    taxes: taxes,
    changeTaxes: changeTaxes,
    calculateTax: calculateTax
  }

  function getTotalRate () {
    var sum = 0;
    for(var tax in taxes) {
      sum += taxes[tax];
    }
    return sum;
  }

  function changeTaxes (new_taxes) {
    for (var i in new_taxes) {
      taxes[i] = new_taxes[i];
    }
  }

  function calculateTax (subTotal) {
    return getTotalRate() * subTotal
  }
}
