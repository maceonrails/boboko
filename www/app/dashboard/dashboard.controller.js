angular
	.module('eresto.dashboard', [])
	.controller('DashboardCtrl', DashboardCtrl)

function DashboardCtrl($scope, $state, $ionicPopup, $rootScope, $timeout, TableService, OrderService, RestService){
	$scope.tables = []
	$rootScope.orders = [];
	$rootScope.init = init;
	init();	
  function init() {
    TableService.getAll().then(function (tables) {
			$scope.tables = _.groupBy(tables, 'location');
			OrderService.getWaitingOrders().then(function (orders) {
				$rootScope.orders = orders;
				$timeout(init, 10000)
			})
		})
  }

	$scope.addOrder = addOrder;
	$scope.showOrder = showOrder;
	$scope.showTable = showTable;

	function showTable (table) {
		if (table.occupied && table.order_id) {
			showOrder(table.order_id)
		} else {
			addOrder(table)
		}
	}

	function showOrder (order_id) {
		$state.go('auth.order', {id: order_id});
	}

	function addOrder(table) {
	 	$scope.order = {};

	 	if(table) {
	 		$scope.order.table_id = table.id;
	 	}
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
	           	e.preventDefault();
	         	} else {
	         		OrderService.create($scope.order).then(function(order) {
			     			if (table) {
			     				table.order_id = order.id;
			     				table.occupied = true;
				     			RestService.one('tables', table.id).customPUT({table: table}).then(function (res) {
				     				console.log(res);
				     			});
			     			}
				     		showOrder(order.id);
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