angular
	.module('eresto.dashboard')
	.directive('erestoOrderHistory', erestoOrderHistory)

function erestoOrderHistory(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: { init: "=" }, // {} = isolate, true = child, false/undefined = no change
		controller: OrderHistoryCtrl,
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'app/order_history/order_history.html',
		replace: true,
		transclude: false,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
		}
	};

	function OrderHistoryCtrl($scope, $state, $ionicPopup, $rootScope, $timeout, $ionicFilterBar, OrderService){
		$rootScope.loadHistoryOrders = loadHistoryOrders
		$scope.showOrder = showOrder
		$scope.historyOrders = []
    $scope.current_page = 1;
    $scope.page_size = 9;
    $scope.moreDataCanBeLoaded = true;
    $scope.findOrder = findOrder
    $scope.loadMoreData = loadMoreData
    $scope.showFilterBar = showFilterBar
    $scope.clearSearch = clearSearch

    function clearSearch () {
    	$scope.searchKey = ''
    	loadHistoryOrders()
    }

    function loadMoreData() {
      params = {
      	page: $scope.current_page,
      	page_size: $scope.page_size,
      	q: $scope.searchKey
      };

      OrderService.getHistoryOrders(params).then(function(result) {
        if ((result.length < $scope.page_size) &&
           ($scope.historyOrders.length < $scope.current_page * $scope.page_size)) {
          $scope.moreDataCanBeLoaded = false;
        }
        $scope.historyOrders = $scope.historyOrders.concat(result);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.current_page++;
      })
    };

		function showFilterBar() {
	    $scope.filterBarInstance = $ionicFilterBar.show({
	      items: $scope.historyOrders,
	      update: function (filteredItems) {
	      	console.log(filteredItems)
	        $scope.historyOrders = filteredItems;
	      },
	      expression: function (filterText, value, index, array) { 
	      	var name_match = value.name.toLowerCase().indexOf(filterText.toLowerCase()) > -1
	      	var struck_match = value.struck_id.toLowerCase().indexOf(filterText.toLowerCase()) > -1
	      	return name_match || struck_match; 
	      },
	      container: '.left'
	    });
	    console.log($scope.filterBarInstance)
	  };
		
		function loadHistoryOrders() {
			$scope.current_page = 1;
			$scope.moreDataCanBeLoaded = true;
			params = {
      	page: $scope.current_page,
      	page_size: $scope.page_size,
      	q: $scope.searchKey
      };
		  OrderService.getHistoryOrders(params).then(function (orders) {
		    $scope.historyOrders = orders;
		    $scope.current_page++;
		  })
		};

		function showOrder (order_id) {
			console.log('show order')
			$state.go('main.order', {id: order_id});
		}

		function findOrder (key) {
			OrderService
		}
	}
}