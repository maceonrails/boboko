angular
	.module('eresto.dashboard', [])
	.controller('DashboardCtrl', DashboardCtrl)

function DashboardCtrl($scope, $state, $ionicPopup, $rootScope, $ionicSideMenuDelegate){
	$scope.showOrder = showOrder;

  $rootScope.refresh = function () {
    $rootScope.tableInit();
    $rootScope.takeAwayInit();
  }

	function showOrder (order_id) {
		$state.go('main.order', {id: order_id});
	}
}