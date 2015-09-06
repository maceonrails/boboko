angular
	.module('eresto.order')
	.directive('itemList', itemList)

function itemList(OrderService, TaxService){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: { order: "=" }, // {} = isolate, true = child, false/undefined = no change
		controller: controller,
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'app/order/item-list.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			
		}
	};

	function controller($scope, $ionicPopup, $element, $attrs, $transclude, OrderService, TaxService) {
		$scope.showItemDetail = showItemDetail
		$scope.getSubTotal = getSubTotal;
		$scope.getTaxTotal = getTaxTotal;
		$scope.getReturnAmount = getReturnAmount;
		$scope.getTotal = getTotal;
		$scope.getPaidAmount = getPaidAmount;
		$scope.getTax = getTax;


		function showItemDetail (orderItem) {
	 		var lastQuantity = orderItem.quantity;
	 		$scope.orderItem = orderItem;
		 	var myPopup = $ionicPopup.show({
		   	templateUrl: 'app/order/item-detail.html',
		   	title: 'Order Item detail',
		   	subTitle: 'Input quantity or write note',
		   	scope: $scope,
		   	buttons: [
		     	{ text: 'Cancel' },
		     	{
		       	text: '<b>Set</b>',
		       	type: 'button-positive',
		       	onTap: function(e) {
					 		if ($scope.orderItem.quantity < lastQuantity) {
			 					if ($scope.orderItem.id) {
					 				$ionicPopup.show({
								   	template: '<input type="text" ng-model="user.email"><input type="password" ng-model="user.password">',
								   	title: 'Need Verification',
								   	subTitle: 'Please input email and password',
								   	scope: $scope,
								   	buttons: [
								     	{ text: 'Cancel' },
								     	{
								       	text: '<b>Gift</b>',
								       	type: 'button-positive',
								       	onTap: function(e) {
								         	if (!$scope.user.name || !$scope.name.pass) {
								           	e.preventDefault();
								         	} else {
								         		AuthenticationService.authorizeUser($scope.user).then(function (res) {
								         			$scope.orderItem.provider_id = res;
								         			$scope.orderItem.void = true;
								         			$scope.orderItem.void_note = $scope.void_note;
								         			$scope.orderItem.void_quantity = $scope.void_quantity;
								         		})
								         	}
								       	}
								     	},
								   	]
								 	});
					 			} else {
					 				if ($scope.orderItem.quantity == 0) 
						 				_.remove($scope.order.orderItems, {
										  product_id: orderItem.product_id
										});
					 			}
					 		}
		       	}
		     	},
		   	]
		 	});
		 	myPopup.then(function(orderItem) {

		 	});
	 	}

	 	function getSubTotal(order) {
			return OrderService.getSubTotal(order);
		}

		function getTaxTotal(order) {
			return OrderService.getTaxTotal(order);
		}

		function getTotal(order) {
			return OrderService.getTotal(order);
		}

		function getPaidAmount(order) {
			return OrderService.getPaidAmount(order);
		}

		function getTax(tax, order) {
			return TaxService.getTax(tax) * OrderService.getSubTotal(order);
		}

		function getReturnAmount (order) {
			return OrderService.getReturnAmount(order)
		}

	}

}
