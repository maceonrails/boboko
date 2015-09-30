angular
	.module('eresto.dashboard')
	.directive('erestoTable', erestoTable)

function erestoTable(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: { init: "=" }, // {} = isolate, true = child, false/undefined = no change
		controller: TableCtrl,
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'app/table/table.html',
		replace: true,
		transclude: false,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
		}
	};

	function TableCtrl($scope, $state, $ionicPopup, $rootScope, $timeout, TableService){
		$scope.tables = []
		$rootScope.tableInit = tableInit
		$scope.showOrder = showOrder;
		$scope.showTable = showTable;

		tableInit()
		
	  function tableInit() {
	  	console.log('table init')
	    TableService.getAll().then(function (tables) {
				$scope.tables = _.groupBy(tables, 'location');
			})
	  }

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
	}
}