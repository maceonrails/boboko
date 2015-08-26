var resource_url = "http://localhost:3000";

app

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

