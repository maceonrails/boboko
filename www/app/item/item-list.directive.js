angular
	.module('eresto.order')
	.directive('erestoItemList', erestoItemList)

function erestoItemList(OrderService, TaxService){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: { order: "=", name: "=", base_order: "=" }, // {} = isolate, true = child, false/undefined = no change
		controller: controller,
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'app/item/item-list.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
		}
	};

	function controller($scope, $ionicPopup, $element, $attrs, $transclude, OrderService, TaxService, PaymentService, AuthService, $state) {
		$scope.clickItem = clickItem
		$scope.getSubTotal = getSubTotal;
		$scope.getTaxAmount = getTaxAmount;
		$scope.getTotal = getTotal;
		$scope.getPaidAmount = getPaidAmount;
		$scope.getDiscountAmount = getDiscountAmount;
		$scope.getTax = getTax;
		$scope.openDiscounts = openDiscounts;

		function openDiscounts (orderItem) {
			if (!$scope.order.waiting)
				return false
			if (orderItem.product.discounts.length) {
				$scope.orderItem = orderItem;
				var last_discount_id = orderItem.discount_id;
				var discount;
			 	$ionicPopup.show({
			   	templateUrl: 'app/item/discount-list.html',
			   	title: 'Discount list',
			   	subTitle: 'Select discount',
			   	scope: $scope,
			   	buttons: [
			   		{
			   			text: 'Cancel',
			   			onTap: function (e) {
			      		orderItem.discount_id = last_discount_id
			     		}
			   		},
			     	{
			       	text: '<b>Pilih</b>',
			       	type: 'button-positive',
			      	onTap: function (e) {
			      		discount = _.find(orderItem.product.discounts, function (discount) { return discount.id == orderItem.discount_id; });
			      		orderItem.price = orderItem.default_price - discount.amount
			     		}
			     	},
			   	]
			 	})
			} else {
				$ionicPopup.alert({
					title: 'Discount list',
					scope: $scope,
					template: '<center>Maaf, tidak ada discount untuk menu ini</center>'
				})
			}
		}

		function clickItem (orderItem) {
			if (!$scope.order.waiting)
				return false
			if ($scope.$root.showRight == 'move') {
				if ($scope.order.type == 'move') {
					moveFromBox(orderItem)
				} else {
					moveToBox(orderItem)
				}
			} else {
				showItemDetail(orderItem)
			}
		}

		function moveToBox (orderItem) {
			OrderService.moveToBox(orderItem, $scope.$parent.order, $scope.$parent.move_order)
		}

		function moveFromBox (orderItem) {
			OrderService.moveFromBox(orderItem, $scope.$parent.move_order, $scope.$parent.order)
		}

		function showItemDetail (orderItem) {
	 		var lastQuantity = orderItem.quantity;
	 		$scope.orderItem = orderItem;
		 	$ionicPopup.show({
		   	templateUrl: 'app/item/item-detail.html',
		   	title: 'Order Item detail',
		   	subTitle: 'Input quantity or write note',
		   	scope: $scope,
		   	buttons: [
		     	{ 
		     		text: 'Cancel', 
		     		onTap: function (e) {
		     			$scope.orderItem = orderItem
		     			return false
		     		}
		     	},
		     	{
		       	text: '<b>Set</b>',
		       	type: 'button-positive',
		       	onTap: function (e) {
		       		return true
			     	}
		     	},
		   	]
		 	}).then(function (res) {
		 		if (res && $scope.orderItem.quantity < lastQuantity) {
 					if ($scope.orderItem.id) {
 						$scope.user = {};
		 				$ionicPopup.show({
					   	templateUrl: 'app/order/void-form.html',
					   	title: 'Need Verification',
					   	subTitle: 'Please input email and password',
					   	scope: $scope,
					   	buttons: [
					     	{ 
					     		text: 'Cancel', 
					     		onTap: function (e) {
					     			$scope.orderItem.quantity = lastQuantity
					     		}
					     	},

					     	{
					       	text: '<b>Void</b>',
					       	type: 'button-positive',
					       	onTap: function(e) {
					         	if (!$scope.user.email || !$scope.user.password) {
					           	e.preventDefault();
					         	} else {
					         		AuthService.authorizeUser($scope.user).then(function (res) {
					         			$scope.orderItem.void_by = res.user.id;
					         			$scope.orderItem.void_quantity = lastQuantity - $scope.orderItem.quantity;
					         			PaymentService.voidItem($scope.orderItem).then(function (res) {
					         				if ($scope.orderItem.quantity == 0) {
										 				_.remove($scope.order.order_items, {
														  product_id: orderItem.product_id
														});
										 			}
					         				$ionicPopup.alert({
														title: 'Void Sukses',
														scope: $scope,
														template: '<center>Reason:<br><br> <b>{{ $scope.orderItem.void_note }}</b> </center>'
													})
									 			}, function (res) {
									 				$scope.orderItem.quantity = lastQuantity
										 			$ionicPopup.alert({
													  title: 'Kesalahan',
													  template: 'Void gagal, silahkan ulangi.'
													})
					         			})
					         		}, function (response) {
					         			$scope.orderItem.quantity = lastQuantity
					         		})
					         	}
					       	}
					     	},
					   	]
					 	});
		 			} else {
		 				if ($scope.orderItem.quantity == 0) {
			 				_.remove($scope.order.order_items, {
							  product_id: orderItem.product_id
							});
			 			}
		 			}
		 		} else if (!res && $scope.orderItem.quantity < lastQuantity) {
		 			$scope.orderItem.quantity = lastQuantity
		 		}
		 	})
	 	}

	 	function getSubTotal(order) {
			return OrderService.getSubTotal(order);
		}

		function getTaxAmount(order) {
			return OrderService.getTaxAmount(order);
		}

		function getTotal(order) {
			return OrderService.getTotal(order);
		}

		function getTax(tax, order) {
			return TaxService.getTax(tax) * OrderService.getSubTotal(order);
		}

		function getPaidAmount(order) {
			return OrderService.getPaidAmount(order);
		}

		function getDiscountAmount (order) {
			return OrderService.getDiscountAmount(order);
		}

	}

}
