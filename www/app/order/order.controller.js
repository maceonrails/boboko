angular
	.module('eresto.order', [])
	.controller('OrderCtrl', OrderCtrl)

function OrderCtrl($rootScope, $scope, $stateParams, $state, OrderService, $ionicPopup, PaymentService){
	$scope.showMenu = showMenu;
	$scope.hideMenu = hideMenu;
	$scope.showCalculator = showCalculator;
	$scope.showSplit = showSplit;
	$scope.showItemBox = showItemBox;
	$scope.voidOrder = voidOrder;
	$scope.ocOrder = ocOrder;
	$scope.saveOrder = saveOrder;
	$scope.printOrder = printOrder;
	$scope.printSplitOrder = printSplitOrder;
	$scope.cancelMove = cancelMove;
	$scope.cancelSplit = cancelSplit;
	$scope.removeOrder = removeOrder;
	$scope.orderHeader = orderHeader;

	// Discount
	$scope.addPercentDiscount = addPercentDiscount;
	$scope.addDiscountAmount = addDiscountAmount;

	// calculator function, will create directive for this

	init();

	$rootScope.show = ''
	$scope.split_order = {};
	$scope.order = {}
	$scope.order.order_items = []
	$scope.split_order.order_items = []
	$scope.split_order.type = 'split'
	$scope.split_order.id = $stateParams.id
	$scope.split_order.discount_amount = 0
	$scope.split_order.cash_amount = 0

	$scope.move_order.order_items = []
	$scope.move_order.type = ''
	$scope.move_order.id = $stateParams.id
	$scope.move_order.discount_amount = 0
	$scope.move_order.cash_amount = 0

	$scope.order.subTotal = 0
	$scope.order.taxAmount = 0
	$scope.order.total = 0
	$scope.order.tax = 0
	$scope.order.paidAmount = 0
	
	function init() {
		OrderService.find($stateParams.id).then(function (order) {
			$scope.order = order
			$scope.order.discount_amount = 0
			$scope.order.discount_percent = 0
			$scope.order.cash_amount = 0
			$scope.itemBlank = order.order_items.length < 1

			$scope.split_order.id = order.id
			$scope.split_order.name = order.name
			$scope.split_order.table_id = order.table_id
			$scope.split_order.waiting = order.waiting
			$scope.split_order.servant_id = order.servant_id
		});
	}


	function orderHeader (order) {
		if (order.table_id) {
			return "Meja " + order.table_name + " (" + order.table_location + ")"
		} else {
			return "#" + order.queue_number
		}
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

	function showItemBox() {
		$rootScope.show = 'move';
	};

	function cancelMove (order, move_order) {
		OrderService.cancelMove(order, move_order)
	}

	function cancelSplit (order, split_order) {
		OrderService.cancelSplit(order, split_order)
		$rootScope.show = 'calculator'
	}

 	function addDiscountAmount (order) {
 		$scope.discount = {}
 		$scope.order = order
	 	$ionicPopup.show({
	   	template: '<input type="text" ng-model="discount.amount">',
	   	title: 'Add Amount Discount',
	   	subTitle: 'Please input Amount discount',
	   	scope: $scope,
	   	buttons: [
	     	{ text: 'Cancel' },
	     	{
	       	text: '<b>Gift</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	       		console.log(order)
	         	if (!$scope.discount.amount || $scope.discount.amount > OrderService.getSubTotal($scope.order)) {
	           	e.preventDefault();
	         	} else {
	         		$scope.order.discount_amount = $scope.discount.amount;
	         	}
	       	}
	     	},
	   	]
	 	});
 	}

 	function addPercentDiscount (order) {
 		$scope.discount = {};
	 	$ionicPopup.show({
	   	template: '<input type="text" ng-model="discount.percent">',
	   	title: 'Add percent Discount',
	   	subTitle: 'Please input percent Discount (0 - 100)',
	   	scope: $scope,
	   	buttons: [
	     	{ text: 'Cancel' },
	     	{
	       	text: '<b>Gift</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	         	if (!$scope.discount.percent || $scope.discount.percent > 100 || $scope.discount.percent < 0) {
	           	e.preventDefault();
	         	} else {
							order.discount_amount = ($scope.discount.percent / 100) * OrderService.getSubTotal(order);
	         	}
	       	}
	     	},
	   	]
	 	});
 	}

 	function ocOrder (order) {
 		$scope.order.note = '';
 		$scope.user = {};
	 	$ionicPopup.show({
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
	         	OrderService.ocOrder(order, $scope.user).then(function (res) {
			 				$ionicPopup.alert({
								title: 'Void Sukses',
								scope: $scope,
								template: '<center>Reason:<br><br> <b>{{ void.note }}</b> </center>'
							}).then(function (res) {
				 				console.log(res);
				 				$state.go('main.dashboard');
				 			})
			 			}, function (res) {
				 			$ionicPopup.alert({
							  title: 'Kesalahan',
							  template: 'Void gagal, silahkan ulangi.'
							})
				 		})
	       	}
	     	},
	   	]
	 	});
 	}

 	function voidOrder (order) {

 		$scope.void = {};
 		$scope.user = {};
	 	$ionicPopup.show({
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
	         	OrderService.voidOrder(order, $scope.user).then(function (res) {
			 				$ionicPopup.alert({
								title: 'Void Sukses',
								scope: $scope,
								template: '<center>Reason:<br><br> <b>{{ $scope.user.note }}</b> </center>'
							}).then(function (res) {
				 				console.log(res);
				 				$state.go('main.dashboard');
				 			})
			 			}, function (res) {
				 			$ionicPopup.alert({
							  title: 'Kesalahan',
							  template: 'Void gagal, silahkan ulangi.'
							})
				 		})
	       	}
	     	},
	   	]
	 	});
 	}

 	function removeOrder (order) {
 		$ionicPopup.confirm({
     	title: 'Delete Order',
     	template: 'Apakah yakin untuk menghapus order?'
   	}).then(function(res) {
     	if(res) {
     		OrderService.find(order.id).then(function (order) {
						if (order.order_items.length < 1) {
       			order.remove();
       			$state.go('main.dashboard');
       		} else {
       			$ionicPopup.alert({
							title: 'Hapus order gagal',
							scope: $scope,
							template: '<center>Maaf, order sudah memiliki pesanan. silahkan lakukan void jika ingin menghapus.</center>'
						})
       		}
       	})
     	}
   	});
 	}

 	function saveOrder (order) {
 		OrderService.saveOrder(order).then(function (res) {
			$ionicPopup.alert({
				title: 'Order sukses',
				scope: $scope,
				template: '<center>Order berhasil disimpan, silahkan tunggu.</center>'
			}).then(function (res) {
 				console.log(res);
 				$state.go('main.dashboard');
 				$scope.refresh();
 			})
		}, function (res) {
 			$ionicPopup.alert({
			  title: 'Terjadi Kesalahan',
			  template: 'Order gagal, silahkan ulangi.'
			})
 		})
 	}

 	function printSplitOrder (order) {
 		OrderService.printSplitOrder(order).then(printCallback, printFailCallback)
 	}

 	function printOrder (order) {
 		OrderService.printOrder(order).then(printSuccessCallback, printFailCallback)
 	}

 	function printSuccessCallback(res) {
		$ionicPopup.alert({
			title: 'Print Order',
			scope: $scope,
			template: '<center>Order sedang di cetak, silahkan tunggu</center>'
		}).then(function (res) {
			console.log(res);
			$scope.refresh();
		})
	}

	function printFailCallback (res) {
		$ionicPopup.alert({
		  title: 'Terjadi Kesalahan',
		  template: 'order gagal di cetak, silahkan ulangi.'
		})
	}
 	

}