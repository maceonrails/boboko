angular
	.module('eresto.dashboard', [])
	.controller('DashboardCtrl', DashboardCtrl)

function DashboardCtrl($scope, $state, $ionicPopup, $rootScope, $timeout, TableService, OrderService, localStorageService){
	$scope.tables = []
	$rootScope.orders = []
	$rootScope.init = init;

	init()
	
  function init() {
  	console.log('init')
    TableService.getAll().then(function (tables) {
			$scope.tables = _.groupBy(tables, 'location');
		})
		OrderService.getWaitingOrders().then(function (orders) {
			$rootScope.orders = orders;
		})
  }

	$scope.addOrder = addOrder;
	$scope.showOrder = showOrder;
	$scope.showTable = showTable;

	function showTable (table) {
		if (table.order_id) {
			showOrder(table.order_id)
		} else {
			$ionicPopup.alert({
			  title: 'Tidak ada order',
			  template: 'Maaf, tidak ada order di meja {{ table.name }}.'
			})
		}
	}

	function showOrder (order_id) {
		$state.go('main.order', {id: order_id});
	}

	function addOrder(table) {
	 	$scope.order = {};

	 	if(table) {
	 		$scope.order.table_id = table.id;
	 	}
	 	// An elaborate, custom popup
	 	$ionicPopup.show({
	   	templateUrl: 'app/dashboard/order-form.html',
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
				     		showOrder(order.id);
	         		})
	         	}
	       	}
	     	},
	   	]
	 	});
	};
}