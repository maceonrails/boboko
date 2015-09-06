angular
	.module('eresto.order', ['eresto.authentication.service'])
	.controller('OrderCtrl', OrderCtrl)

function OrderCtrl($scope, $stateParams, $state, PaymentService, OrderService, MenuService, TaxService, DiscountService, $ionicPopup, RestService, AuthenticationService){
	$scope.showMenu = showMenu;
	$scope.hideMenu = hideMenu;
	$scope.showCalculator = showCalculator;
	$scope.showSplit = showSplit;
	$scope.addMenu = addMenu;
	$scope.removeMenu = removeMenu;
	$scope.showItemPopup = showItemPopup;
	$scope.showSubCategories = showSubCategories;
	$scope.showProducts = showProducts;
	$scope.payAll = payAll;
	$scope.paySplit = paySplit;
	$scope.voidOrder = voidOrder;
	$scope.showItemDetail = showItemDetail;
	$scope.saveOrder = saveOrder;

	$scope.getSubTotal = getSubTotal;
	$scope.getTaxTotal = getTaxTotal;
	$scope.getReturnAmount = getReturnAmount;
	$scope.getTotal = getTotal;
	$scope.getPaidAmount = getPaidAmount;
	$scope.getTax = getTax;

	// Discount
	$scope.addPercentDiscount = addPercentDiscount;
	$scope.addAmountDiscount = addAmountDiscount;

	// calculator function, will create directive for this
	$scope.calcAddDigit = calcAddDigit;
	$scope.calcAddMoney = calcAddMoney;
	$scope.calcClear = calcClear;
	$scope.calcDelete = calcDelete;

	init();

	function init() {
		$scope.splitOrder = {};
		$scope.order = {}
		$scope.order.orderItems = []
		$scope.splitOrder.orderItems = []
		$scope.splitOrder.name = 'Split'
		OrderService.find($stateParams.id).then(function (order) {
			$scope.order = order;
			$scope.order.discountAmount = 0;
			$scope.order.cashAmount = 0;
			OrderService.getOrderItems(order, {paid: false, void: false}).then(function (orderItems) {
				$scope.order.orderItems = orderItems;
			})
		});
		MenuService.getCategories().then(function (categories) {
			$scope.categories = categories;
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

	function showMenu() {
		$scope.show = 'menu';
	};

	function hideMenu() {
		$scope.show = '';
	};

	function showCalculator() {
		$scope.show = 'calculator';
	};

	function showSplit() {
		$scope.show = 'split';
	};

	function addMenu(product, order) {
		$scope.order = OrderService.addMenu(product, order);
	};

	function changeItem (argument) {
		// body...
	}

	function removeMenu(index) {
		$scope.order.orderItems.splice(index, 1);
	};

	function showItemPopup(index) {
	};

	function showSubCategories(category) {
   	$scope.subCategories = category.getList('product_sub_categories').$object;
		$scope.activeCat = category.id;
		$scope.activeSubCat = null;
	};

	function showProducts(subCategory) {
		$scope.products = subCategory.getList('products').$object;
		$scope.activeSubCat = subCategory.id;
	};

	function calcAddDigit (digit) {
		$scope.order.cashAmount = parseInt($scope.order.cashAmount.toString() + digit);
	}

	function calcAddMoney (cash) {
		$scope.order.cashAmount += cash;
	}

	function calcClear() {
		$scope.order.cashAmount = 0;
	}

	function calcDelete () {
		if ($scope.order.cashAmount > 9) {
			$scope.order.cashAmount = parseInt($scope.order.cashAmount.toString().slice(0, -1));
		} else {
			calcClear();
		}
	}

 	function payAll(order, orderItems) {
 		if (getPaidAmount(order) > order.cashAmount) {
 			$ionicPopup.alert({
				title: 'Kesalahan',
				template: 'Pembayaran tidak cukup atau tidak ada menu yang di pilih.'
			}).then(function (res) {
 				console.log(res);
 			})
 		} else {
 			PaymentService.payOrder(order, orderItems).then(function (order) {
 				$ionicPopup.alert({
					title: 'Pembayaran berhasil',
					scope: $scope,
					template: '<center>Kembali:<br><br> <b>{{getReturnAmount(order) | currency: "Rp "}}</b> </center>'
				}).then(function (res) {
	 				console.log(res);
	 				$state.go('auth.dashboard');
	 			})
 			}, function (order) {
	 			$ionicPopup.alert({
				  title: 'Kesalahan',
				  template: 'Pembayaran gagal, silahkan ulangi.'
				}).then(function(res) {	 
	 				console.log(res);
	 			})
	 		})
 		}
 	}

 	function paySplit (splitOrder) {
 		if ($scope.shouldPaid > $scope.paidAmount && $scope.shouldPaid !== 0) {
 			notAllowedPopup.then(function (res) {
 				console.log(res);
 			})
 		} else {
 			PaymentService.paySplit(splitOrder).then(function (payment) {
	 			successPopup.then(function (res) {
	 				console.log(res, payment);
	 				$state.go('auth.dashboard');
	 			})
	 		}, function (error) {
	 			failedPopup.then(function(res) {	 
	 				console.log(res, error);
	 			})
	 		})
 		}
 		
 	}

 	function addAmountDiscount () {
 		$scope.discount = {};
	 	var discountPopup = $ionicPopup.show({
	   	templateUrl: 'app/order/discount-form.html',
	   	title: 'Add Amount Discount',
	   	subTitle: 'Please input Amount discount',
	   	scope: $scope,
	   	buttons: [
	     	{ text: 'Cancel' },
	     	{
	       	text: '<b>Gift</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	         	if (!$scope.discount.amount) {
	           	e.preventDefault();
	         	} else {
	         		$scope.amountDiscount = $scope.discount.amount;
	         	}
	       	}
	     	},
	   	]
	 	});
	 	discountPopup.then(function(name) {	 
	 	});
 	}

 	function addPercentDiscount () {
 		$scope.discount = {};
	 	var percentPopup = $ionicPopup.show({
	   	templateUrl: 'app/order/discount-form.html',
	   	title: 'Add percent Discount',
	   	subTitle: 'Please input percent Discount (0 - 100)',
	   	scope: $scope,
	   	buttons: [
	     	{ text: 'Cancel' },
	     	{
	       	text: '<b>Gift</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	         	if (!$scope.discount.amount) {
	           	e.preventDefault();
	         	} else {
							$scope.amountDiscount = ($scope.discount.amount / 100) * $scope.subTotal;
	         	}
	       	}
	     	},
	   	]
	 	});
	 	percentPopup.then(function(amountDiscount) {	 
	 	});
 	}

 	function voidOrder (order, orderItems) {
 		$scope.void = {};
	 	var myPopup = $ionicPopup.show({
	   	templateUrl: 'app/order/void-form.html',
	   	title: 'Void Order',
	   	subTitle: 'Please input reason',
	   	scope: $scope,
	   	buttons: [
	     	{ text: 'Cancel' },
	     	{
	       	text: '<b>Gift</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	         	order.void_note = $scope.void.note;
	         	PaymentService.payOrder(order, orderItems).then(function (res) {
			 				$ionicPopup.alert({
								title: 'Void Sukses',
								scope: $scope,
								template: '<center>Reason:<br><br> <b>{{ void.note }}</b> </center>'
							}).then(function (res) {
				 				console.log(res);
				 				$state.go('auth.dashboard');
				 			})
			 			}, function (res) {
				 			$ionicPopup.alert({
							  title: 'Kesalahan',
							  template: 'Void gagal, silahkan ulangi.'
							}).then(function(res) {	 
				 				console.log(res);
				 			})
				 		})
	       	}
	     	},
	   	]
	 	});
	 	myPopup.then(function(name) {	 		
	 	});
 	}

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

 	function saveOrder (order, orderItems) {
 		OrderService.save(order).then(function (res) {
			$ionicPopup.alert({
				title: 'Order sukses',
				scope: $scope,
				template: '<center>Order berhasil disimpan, silahkan tunggu.</center>'
			}).then(function (res) {
 				console.log(res);
 				$state.go('auth.dashboard');
 			})
			}, function (res) {
 			$ionicPopup.alert({
			  title: 'Terjadi Kesalahan',
			  template: 'Order gagal, silahkan ulangi.'
			}).then(function(res) {	 
 				console.log(res);
 			})
 		})
 	}
 	

}