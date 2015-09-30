angular
	.module('eresto.dashboard')
	.directive('erestoTakeAway', erestoTakeAway)

function erestoTakeAway(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: { init: "=" }, // {} = isolate, true = child, false/undefined = no change
		controller: TakeAwayCtrl,
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'app/take_away/take_away.html',
		replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
		}
	};

	function TakeAwayCtrl($scope, $rootScope, $state, $ionicPopup, $timeout, OrderService){
		$scope.orders = []
		$rootScope.takeAwayInit = takeAwayInit;
		$scope.addOrder = addOrder;
		$scope.showOrder = showOrder;

		takeAwayInit()
		
	  function takeAwayInit() {
	  	console.log('take away init')
			OrderService.getWaitingOrders().then(function (orders) {
				$scope.orders = orders;
			})
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
		   	templateUrl: 'app/take_away/order-form.html',
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
}