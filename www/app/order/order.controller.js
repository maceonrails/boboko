angular
	.module('eresto.order', [])
	.controller('OrderCtrl', OrderCtrl)

function OrderCtrl($rootScope, $scope, $stateParams, $state, OrderService, $ionicPopup, PaymentService, AuthService){
	$scope.showMenu = showMenu;
	$scope.hideMenu = hideMenu;
	$scope.showCalculator = showCalculator;
	$scope.showSplit = showSplit;
	$scope.showItemBox = showItemBox;
	$scope.voidOrder = voidOrder;
	$scope.ocOrder = ocOrder;
	$scope.saveOrder = saveOrder;
	$scope.printOrder = printOrder;
	$scope.reprintOrder = reprintOrder;
	$scope.printSplitOrder = printSplitOrder;
	$scope.cancelMove = cancelMove;
	$scope.cancelSplit = cancelSplit;
	$scope.removeOrder = removeOrder;
	$scope.orderHeader = orderHeader;
	$scope.splitOrder = splitOrder;

	// Discount
	$scope.addPercentDiscount = addPercentDiscount;
	$scope.addDiscountAmount = addDiscountAmount;

	// calculator function, will create directive for this

	init();

	$rootScope.showLeft = ''
	$rootScope.showRight = ''
	$scope.order = {}
	$scope.order.total_discount = 0
	$scope.order.order_items = []

	$scope.move_order = {
		order_items: [],
		type: 'move',
		id: $stateParams.id,
		discount_amount: 0,
		pay_amount: 0
	};
	
	function init() {
		OrderService.find($stateParams.id).then(function (order) {
			$scope.order = order
			$scope.order.total_discount = OrderService.getDiscountAmount(order)
			$scope.order.discount_percent = order.discount_percent
			$scope.order.discount_amount = order.discount_amount
			$scope.order.pay_amount = 0
			$scope.order.return_amount = 0
			$scope.order.cash_amount = order.cash_amount || 0
			$scope.order.credit_amount = order.credit_amount || 0
			$scope.order.debit_amount = order.debit_amount || 0
			$scope.itemBlank = order.order_items.length < 1
			
			$scope.move_order.id = order.id
			$scope.move_order.name = order.name
			$scope.move_order.table_id = order.table_id
			$scope.move_order.waiting = order.waiting
			$scope.move_order.servant_id = order.servant_id
			$scope.move_order.pay_amount = 0
			$scope.move_order.return_amount = 0
			$scope.move_order.cash_amount = order.cash_amount || 0
			$scope.move_order.credit_amount = order.credit_amount || 0
			$scope.move_order.debit_amount = order.debit_amount || 0
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
		$rootScope.showRight = 'menu';
	};

	function hideMenu() {
		$rootScope.showRight = '';
	};

	function showCalculator(order) {
		if (order.type == "move") {
			$rootScope.showRight = 'splitCalculator'
			init()
		} else {
			init()
			$rootScope.showRight = 'orderCalculator'
		}
	};

	function showSplit() {
		$rootScope.show = 'split';
	};

	function splitOrder () {
		if ($scope.move_order.order_items.length < 1) {
			$ionicPopup.alert({
			  title: 'Kesalahan',
			  template: 'Tidak ada item yang dipilih.'
			})
		} else {
			$rootScope.showLeft = 'splitOrder';
			$rootScope.showRight = '';
		}
	}

	function showItemBox() {
		$rootScope.showRight = 'move';
	};

	function cancelMove (order, move_order) {
		OrderService.cancelMove(order, move_order)
		$rootScope.showRight = '';
		$rootScope.showLeft = '';
	}

	function cancelSplit (order, split_order) {
		// OrderService.cancelSplit(order, split_order)
		$rootScope.showRight = 'move';
		$rootScope.showLeft = '';
	}

	function addDiscount (order, discount) {
		var previous_discount_amount = order.discount_amount
		var previous_discount_percent = order.discount_percent
		$scope.order = order
		$scope.user = {}
		$scope.discount = discount
		$scope.discount.amount = parseInt(previous_discount_amount)
		$scope.discount.percent = parseInt(previous_discount_percent)
		$ionicPopup.show({
	   	templateUrl: 'app/order/discount-form.html',
	   	title: 'Need verification for discount',
	   	subTitle: 'Please input email and password',
	   	scope: $scope,
	   	buttons: [
	     	{ 
	     		text: 'Cancel'
	     	},
	     	{
	       	text: '<b>Verify</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	       		if (!$scope.user.email || !$scope.user.password) {
	       			e.preventDefault();
	       		}
	       		else if (discount.type == 'percent') {
		       		if ($scope.discount.percent > 100 || $scope.discount.percent < 0) {
		           	e.preventDefault();
		         	} else {
								AuthService.authorizeUserForDiscount($scope.user).then(function (res) {
			         		order.discount_by = res.user.id
									order.discount_amount = ($scope.discount.percent / 100) * OrderService.getSubTotal(order);
									order.discount_percent = $scope.discount.percent
					 			}, function (res) {
					 				order.discount_amount = previous_discount_amount
					 				order.discount_percent = previous_discount_percent
						 			$ionicPopup.alert({
									  title: 'Kesalahan',
									  template: 'Maaf user tidak terverifikasi, silahkan ulangi.'
									})
						 		})
							}
	         	}
	       		else {
	       			if ($scope.discount.amount > OrderService.getSubTotal(order)) {
		           	e.preventDefault();
		         	} else {
		         		AuthService.authorizeUserForDiscount($scope.user).then(function (res) {
			         		order.discount_by = res.user.id
			         		order.discount_amount = $scope.discount.amount
			         		order.discount_percent = 0
					 			}, function (res) {
					 				order.discount_amount = previous_discount_amount
					 				order.discount_percent = previous_discount_percent
						 			$ionicPopup.alert({
									  title: 'Kesalahan',
									  template: 'Maaf user tidak terverifikasi, silahkan ulangi.'
									})
						 		})
		         	}
	         	}
	       	}
	     	},
	   	]
	 	});
	}

 	function addDiscountAmount (order) {
 		addDiscount(order, { type: 'amount' })
 	}

 	function addPercentDiscount (order) {
 		addDiscount(order, { type: 'percent' })
 	}

 	function ocOrder (order) {
 		if (order.order_items.length < 1) {
			$ionicPopup.alert({
			  title: 'Kesalahan',
			  template: 'Tidak ada item yang dipilih.'
			})
			return false
		}

 		$scope.order.note = '';
 		$scope.user = {};
	 	$ionicPopup.show({
	   	templateUrl: 'app/order/oc-form.html',
	   	title: 'Operational Cost',
	   	subTitle: 'Please input reason',
	   	scope: $scope,
	   	buttons: [
	     	{ text: 'Cancel' },
	     	{
	       	text: '<b>Gift</b>',
	       	type: 'button-positive',
	       	onTap: function(e) {
	         	OrderService.ocOrder(order, $scope.user).then(function (res) {
				 			order.order_items = []
			 				$ionicPopup.alert({
								title: 'OC Sukses',
								scope: $scope,
								template: '<center>OC sukses di simpan</center>'
							}).then(function (res) {
				 				console.log(res);
				 				// $state.go('main.dashboard');
				 			})
			 			}, function (res) {
				 			$ionicPopup.alert({
							  title: 'Kesalahan',
							  template: 'OC gagal, silahkan ulangi.'
							})
				 		})
	       	}
	     	},
	   	]
	 	});
 	}

 	function voidOrder (order) {
 		if (order.order_items.length < 1) {
			$ionicPopup.alert({
			  title: 'Kesalahan',
			  template: 'Tidak ada item yang dipilih.'
			})
			return false
		}

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
	         		order.order_items = []
			 				$ionicPopup.alert({
								title: 'Void Sukses',
								scope: $scope,
								template: '<center><b>Void sudah di simpan</b></center>'
							}).then(function (res) {
				 				console.log(res);
				 				// $state.go('main.dashboard');
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
 				// $scope.refresh();
 			})
		}, function (res) {
 			$ionicPopup.alert({
			  title: 'Terjadi Kesalahan',
			  template: 'Order gagal, silahkan ulangi.'
			})
 		})
 	}

 	function printSplitOrder (order) {
 		OrderService.printSplitOrder(order).then(printSuccessCallback, printFailCallback)
 	}

 	function printOrder (order) {
 		OrderService.printOrder(order).then(printSuccessCallback, printFailCallback)
 	}

 	function reprintOrder (order) {
 		OrderService.reprintOrder(order).then(printSuccessCallback, printFailCallback)
 	}

 	function printSuccessCallback(res) {
		$ionicPopup.alert({
			title: 'Print Order',
			scope: $scope,
			template: '<center>Order sedang di cetak, silahkan tunggu</center>'
		}).then(function (res) {
			console.log(res);
			// $scope.refresh();
		})
	}

	function printFailCallback (res) {
		$ionicPopup.alert({
		  title: 'Terjadi Kesalahan',
		  template: 'order gagal di cetak, silahkan ulangi.'
		})
	}
 	

}