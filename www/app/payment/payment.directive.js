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

	function controller($scope, $rootScope, $element, $attrs, $transclude, $ionicPopup, $state, OrderService, PaymentService, TaxService) {
		$scope.calcAddDigit = calcAddDigit;
		$scope.calcAddMoney = calcAddMoney;
		$scope.calcClear = calcClear;
		$scope.calcDelete = calcDelete;
		$scope.getReturnAmount = getReturnAmount;
		$scope.getPaidAmount = getPaidAmount;
		$scope.getRemainAmount = getRemainAmount;
		$scope.payAll = payAll;
		$scope.taxes = {};
		$scope.hideMenu = hideMenu;
		$scope.cashPayment = cashPayment;
		$scope.creditPayment = creditPayment;
		$scope.debitPayment = debitPayment;
		$scope.cardPayment = cardPayment;

		init()

		function init () {
			TaxService.getTaxes().then(function (res) {
				$scope.taxes = res
			});
		}

		function cashPayment () {
			$scope.order.cash_amount = $scope.order.pay_amount
			$scope.order.return_amount = getReturnAmount($scope.order, $scope.taxes)
			$scope.order.pay_amount = 0
		}

		function creditPayment () {
			cardPayment('credit')	
		}

		function debitPayment () {
			cardPayment('debit')
		}

		function cardPayment (card) {
			$scope.card = {type: card}
			$scope.card.name = $scope.order[card+'_name']
			$scope.card.number = $scope.order[card+'_number']
			if ($scope.order.pay_amount <= 0) {
				$scope.order[card + '_amount'] = $scope.order.pay_amount
				$scope.order.pay_amount = getRemainAmount($scope.order, $scope.taxes)
			}
			$ionicPopup.show({
		   	templateUrl: 'app/payment/card-detail.html',
		   	title: 'Card detail',
		   	// subTitle: 'Please input name',
		   	scope: $scope,
		   	buttons: [
		     	{ 
		     		text: 'Cancel' 
		     	},
		     	{
		       	text: '<b>Save</b>',
		       	type: 'button-positive',
		       	onTap: function(e) {
		         	if (!$scope.card.name || !$scope.card.number) {
		           	e.preventDefault();
		         	} else {
		         		$scope.order[card + '_amount'] = $scope.order.pay_amount
								$scope.order[card + '_number'] = $scope.card.number
								$scope.order[card + '_name'] = $scope.card.name
								$scope.order.return_amount = getReturnAmount($scope.order, $scope.taxes)
								$scope.order.pay_amount = 0
		         	}
		       	}
		     	},
		   	]
		 	});
		}

		function hideMenu() {
			$scope.order.pay_amount = 0
			$scope.$parent.hideMenu();
		};

		function calcAddDigit (digit) {
			$scope.order.pay_amount = parseInt($scope.order.pay_amount.toString() + digit);
		}

		function calcAddMoney (cash) {
			$scope.order.pay_amount += cash;
		}

		function calcClear() {
			$scope.order.pay_amount = 0;
		}

		function getPaidAmount(order, taxes) {
			return OrderService.getPaidAmount(order, taxes);
		}

		function getRemainAmount(order, taxes) {
			return OrderService.getRemainAmount(order, taxes);
		}

		function getReturnAmount (order, taxes) {
			return OrderService.getReturnAmount(order, taxes)
		}

		function calcDelete () {
			if ($scope.order.pay_amount > 9) {
				$scope.order.pay_amount = parseInt($scope.order.pay_amount.toString().slice(0, -1));
			} else {
				calcClear();
			}
		}

		function payAll(order, taxes) {
			if ((order.credit_amount > 0 && !order.credit_name) || (order.debit_amount > 0 && !order.debit_name) ) {
				$ionicPopup.alert({
					title: 'Kesalahan',
					template: 'Silahkan input card detail terlebih dahulu.'
				})
			} else if (getRemainAmount(order, taxes) > 0) {
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
	 			if (order.credit_amount <= 0 && order.debit_amount <= 0 && (order.card_name || order.card_number) ) {
	 				order.card_name = null
	 				order.card_number = null
	 			}
 				PaymentService.payOrder(order).then(function (order) {
 					order.order_items = []
	 				$ionicPopup.alert({
						title: 'Pembayaran berhasil',
						scope: $scope,
						template: '<center>Kembali:<br><br> <h3>{{order.return_amount | currency: "Rp "}}</h3> </center>'
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