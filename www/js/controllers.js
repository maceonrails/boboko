angular.module('erestoCashier.controllers', [])
  
.controller('LoginCtrl', function($scope, $http, $state, AuthenticationService) {
  $scope.message = "";
  
  $scope.user = {
    username: null,
    password: null
  };
 
  $scope.login = function() {
    AuthenticationService.login($scope.user);
  };
 
  $scope.$on('event:auth-loginRequired', function(e, rejection) {
    $scope.loginModal.show();
  });
 
  $scope.$on('event:auth-loginConfirmed', function() {
     $scope.username = null;
     $scope.password = null;
     $scope.loginModal.hide();
  });
  
  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    if (status == 401) {
      error = "Invalid Username or Password.";
    }
    $scope.message = error;
  });
 
  $scope.$on('event:auth-logout-complete', function() {
    $state.go('app.home', {}, {reload: true, inherit: false});
  });    	
})

.controller('HomeCtrl', function($scope, $state, $ionicPopup, OrderService, Room){
	$scope.rooms = Room.index();
	$scope.waitingOrders = OrderService.waitingList();
	$scope.addOrder = function() {
	 	$scope.order = {};

	 	// An elaborate, custom popup
	 	var myPopup = $ionicPopup.show({
	   	template: '<input type="text" ng-model="order.name">',
	   	title: 'Take away Order',
	   	subTitle: 'Please input name',
	   	scope: $scope,
	   	buttons: [
	     	{ text: 'Cancel' },
	     	{
	       	text: '<b>Save</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	         	if (!$scope.order.name) {
	           	//don't allow the user to close unless he enters wifi password
	           	e.preventDefault();
	         	} else {
	         		order = OrderService.new($scope.order)
				   		$scope.orders.push(order);
			     		$state.go('order', {id: $scope.order.id});
	         	}
	       	}
	     	},
	   	]
	 	});
	 	myPopup.then(function(name) {	 		
	 	});
	};
})

.controller('OrderCtrl', function($scope, $stateParams, $filter, Order, Category, SubCategory, OrderItem, Menu){
	
	$scope.order = OrderService($stateParams.id);
	
	$scope.categories = Category.index();
	$scope.showMenu = function() {
		debugger
		$scope.show = 'menu';
	};
	$scope.hideMenu = function() {
		$scope.show = '';
	};
	$scope.showCalculator = function() {
		$scope.show = 'calculator';
	};

	$scope.showSub = function(category) {
		Category.show(category).$promise.then(function(category) {
   		$scope.sub_categories = category.sub_categories;
			$scope.activeCat = category.id;
    });
	}

	$scope.showMenus = function (sub_category) {
		SubCategory.show(sub_category).$promise.then(function(sub_category) {
   		$scope.menus = sub_category.menus;
			$scope.activeCat = sub_category.id;
    });
	}

	$scope.addMenu = function (menu) {
		// var found = $filter('filter')($scope.order_items, {menu_id: menu.id}, true);
  //    if (found.length) {
  //    } else {
  //    }
		// var order_item = new OrderItem({menu_id: menu.id, quantity: 1}) 
		OrderItem.create({order_id: $scope.order.id, menu_id: menu.id, quantity: 1}).$promise.then(function(orderItem) {
   		$scope.order_items.push(orderItem);
    });
	}

})