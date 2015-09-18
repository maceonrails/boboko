angular
	.module('eresto.menu.service', [])
	.factory('MenuService', MenuService)

function MenuService (Restangular) {
	var categories = Restangular.all('product_categories');
	var subCategories = Restangular.all('product_sub_categories');
	var products = Restangular.all('products');
	return {
		getCategories: getCategories,
		getSubCategories: getSubCategories,
		getProducts: getProducts
	}

	function getCategories () {
		return categories.getList().then(function (categories) {
			return categories
		})
	}

	function getSubCategories (category) {
		return category.getList("sub_categories").then(function (subCategories) {
			return subCategories
		})
	}

	function getProducts (subCategory) {
		return subCategory.getList("products").then(function (products) {
			return products
		})
	}
}