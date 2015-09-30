angular
	.module('eresto.order')
	.directive('erestoMenu', erestoMenu)

function erestoMenu(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		controller: controller,
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'app/menu/menu.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			
		}
	};

	function controller($scope, $element, $attrs, $transclude, OrderService, MenuService) {
		$scope.addMenu = addMenu;
		$scope.removeMenu = removeMenu;
		$scope.showItemPopup = showItemPopup;
		$scope.showSubCategories = showSubCategories;
		$scope.showProducts = showProducts;
		$scope.categories = [];

		MenuService.getCategories().then(function (categories) {
			$scope.categories = categories;
		});

		function addMenu(product, order) {
			if (product.sold_out) {
				$ionicPopup.alert({
					title: 'Product sold out',
					template: '<center>Maaf product sedang tidak tersedia.</center>'
				}).then(function (res) {
	 				console.log(res);
	 			})
			} else {
				$scope.order = OrderService.addMenu(product, order);
			}
		};

		function changeItem (argument) {
			// body...
		}

		function removeMenu(index) {
			$scope.order.order_items.splice(index, 1);
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
	}
}