angular
	.module('erestoCashier.controllers', [])
	.controller('AppCtrl', AppCtrl)
	.controller('LoginCtrl', LoginCtrl)
	.controller('TableCtrl', TableCtrl)
	.controller('OrderCtrl', OrderCtrl)


function AppCtrl($scope, $state, $ionicModal) {
	$scope.$on('event:auth-loginRequired', function(e, rejection) {
    console.log('handling login required');
    $state.go('app.login', {}, {reload: true, inherit: false});
  });
 
  $scope.$on('event:auth-loginConfirmed', function() {
	 $scope.username = null;
	 $scope.password = null;
	 $state.go('app.home', {}, {reload: true, inherit: false});
  });
  
  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    if (status == 401) {
      error = "Invalid Username or Password.";
    }
    $scope.message = error;
  });
 
  $scope.$on('event:auth-logout-complete', function() {
    console.log("logout complete");
    $state.go('app.home', {}, {reload: true, inherit: false});
  });    	
}
  

function LoginCtrl($scope, $http, $state, AuthenticationService, localStorageService) {
  $scope.message = "";
  localStorageService.remove('token');
  $scope.user = {
    username: null,
    password: null
  };
 
  $scope.login = function() {
    AuthenticationService.login($scope.user);
  };
}


function TableCtrl($scope, $state, $ionicPopup, $rootScope, $timeout, TableService, OrderService){
	TableService.getAll().then(function (tables) {
		$scope.tables = _.groupBy(tables, 'location');
	})

	OrderService.getWaitingOrders().then(function (orders) {
		$scope.orders = orders;
	})

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
	         		OrderService.create($scope.order).then(function(order) {
			     			$state.go('app.order', {id: order.id});
	         		})
	         	}
	       	}
	     	},
	   	]
	 	});
	 	myPopup.then(function(name) {	 		
	 	});
	};
}


function OrderCtrl($scope, $stateParams, $filter, OrderService, CategoryService, OrderItemService, TaxService, DiscountService){
	CategoryService.getAll().then(function (categories) {
		$scope.categories = categories;
	});
	$scope.order = OrderService.find($stateParams.id).$object;
	$scope.orderItems = [];
	$scope.total = 0;
	$scope.should_paid = 0;
	$scope.pay = 0;
	$scope.discount = 0.05;

	calculate()

	function calculate() {
		$scope.subTotal = OrderService.getSubTotal($scope.orderItems);
		$scope.total = $scope.subTotal + ($scope.totalTaxes * $scope.total)
		$scope.totalTaxes = TaxService.calculateTax($scope.total);
		$scope.should_paid = $scope.total + ($scope.totalTaxes * $scope.total) - ($scope.discount * $scope.total);
	}

	$scope.showMenu = function() {
		$scope.show = 'menu';
	};
	$scope.hideMenu = function() {
		$scope.show = '';
	};
	$scope.showCalculator = function() {
		$scope.show = 'calculator';
	};

	$scope.showSplit = function() {
		$scope.show = 'split';
	}

	$scope.addMenu = function(product) {
		var orderItem = { quantity: 1, product: product }
		var sameItem = false;
		for (i in $scope.orderItems) {
			if ($scope.orderItems[i].product.id === product.id) {
				$scope.orderItems[i].quantity++;
				sameItem = true;
				break;
			} 
		}
		if ($scope.orderItems.length === 0 || !sameItem) {
			$scope.orderItems.push(orderItem);
		}
		calculate();
	}

	$scope.removeMenu = function(index) {
		$scope.orderItems.splice(index, 1);
		calculate();
	}

	$scope.showItemPopup = function(index) {
		
	} 

	$scope.showSubCategory = function(category) {
   	$scope.subCategories = category.getList('product_sub_categories').$object;
		$scope.activeCat = category.id;
		$scope.activeSubCat = null;
	}
	$scope.showProducts = function(subCategory) {
		$scope.products = subCategory.getList('products').$object;
		$scope.activeSubCat = subCategory.id;
	}
}