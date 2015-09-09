angular
	.module('eresto.order', [])
	.controller('OrderCtrl', OrderCtrl)

function OrderCtrl($rootScope, $scope, $stateParams, $state, OrderService, $ionicPopup){
	$scope.showMenu = showMenu;
	$scope.hideMenu = hideMenu;
	$scope.showCalculator = showCalculator;
	$scope.showSplit = showSplit;
	$scope.voidOrder = voidOrder;
	$scope.saveOrder = saveOrder;
	$scope.cancelSplit = cancelSplit;

	// Discount
	$scope.addPercentDiscount = addPercentDiscount;
	$scope.addDiscountAmount = addDiscountAmount;

	// calculator function, will create directive for this

	init();

	function init() {
		$rootScope.show = ''
		$scope.split_order = {};
		$scope.order = {}
		$scope.order.order_items = []
		$scope.split_order.order_items = []
		$scope.split_order.type = 'split'
		$scope.split_order.id = $stateParams.id
		$scope.split_order.discount_amount = 0
		$scope.split_order.cash_amount = 0
		OrderService.find($stateParams.id).then(function (order) {
			$scope.order = order
			$scope.order.discount_amount = 0
			$scope.order.cash_amount = 0

			$scope.split_order.id = order.id
			$scope.split_order.name = order.name
			$scope.split_order.table_id = order.table_id
			$scope.split_order.waiting = order.waiting
			$scope.split_order.servant_id = order.servant_id
		});
	}


	function showMenu() {
		$rootScope.show = 'menu';
	};

	function hideMenu() {
		$rootScope.show = '';
	};

	function showCalculator(order) {
		if (order.type == "split") {
			$rootScope.show = 'splitCalculator'
		} else {
			$rootScope.show = 'orderCalculator'
		}
	};

	function showSplit() {
		$rootScope.show = 'split';
	};

	function cancelSplit (order, split_order) {
		OrderService.cancelSplit(order, split_order)
		$rootScope.show = 'calculator'
	}

 	function addDiscountAmount () {
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
	         		$scope.discount_amount = $scope.discount.amount;
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
							$scope.discount_amount = ($scope.discount.amount / 100) * $scope.sub_total;
	         	}
	       	}
	     	},
	   	]
	 	});
	 	percentPopup.then(function(discount_amount) {	 
	 	});
 	}

 	function voidOrder (order, order_items) {
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
	         	PaymentService.payOrder(order, order_items).then(function (res) {
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

 	function saveOrder (order, order_items) {
 		OrderService.saveOrder(order).then(function (res) {
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