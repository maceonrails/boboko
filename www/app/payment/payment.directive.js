angular
	.module('eresto.order')
	.directive('erestoPayment', erestoPayment)

function erestoPayment(){
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
		templateUrl: 'app/payment/payment.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			
		}
	};

	function controller($scope, $element, $attrs, $transclude, $ionicPopup, $state, OrderService, PaymentService, AuthService) {
		$scope.calcAddDigit = calcAddDigit;
		$scope.calcAddMoney = calcAddMoney;
		$scope.calcClear = calcClear;
		$scope.calcDelete = calcDelete;
		$scope.getReturnAmount = getReturnAmount;
		$scope.getPaidAmount = getPaidAmount;
		$scope.payAll = payAll;

		function calcAddDigit (digit) {
			$scope.order.cash_amount = parseInt($scope.order.cash_amount.toString() + digit);
		}

		function calcAddMoney (cash) {
			$scope.order.cash_amount += cash;
		}

		function calcClear() {
			$scope.order.cash_amount = 0;
		}

		function getPaidAmount(order) {
			return OrderService.getPaidAmount(order);
		}

		function getReturnAmount (order) {
			return OrderService.getReturnAmount(order)
		}

		function calcDelete () {
			if ($scope.order.cash_amount > 9) {
				$scope.order.cash_amount = parseInt($scope.order.cash_amount.toString().slice(0, -1));
			} else {
				calcClear();
			}
		}

		function payAll(order) {
	 		if (getPaidAmount(order) > order.cash_amount || order.cash_amount == 0) {
	 			$ionicPopup.alert({
					title: 'Kesalahan',
					template: 'Pembayaran tidak cukup atau tidak ada menu yang di pilih.'
				})
	 		} else if (order.discount_amount > OrderService.getSubTotal(order)) {
	 			$ionicPopup.alert({
					title: 'Kesalahan',
					template: 'Discount lebih besar dari jumlah transaksi.'
				})
	 		} else {
 				PaymentService.payOrder(order).then(function (order) {
 					order.order_items = []
	 				$ionicPopup.alert({
						title: 'Pembayaran berhasil',
						scope: $scope,
						template: '<center>Kembali:<br><br> <h3>{{getReturnAmount(order) | currency: "Rp "}}</h3> </center>'
					}).then(function (res) {
		 				console.log(res);
		 				$state.go('main.dashboard');
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
	}
}