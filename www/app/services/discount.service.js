angular
	.module('eresto.discount.service', [])
	.factory('DiscountService', DiscountService)

function DiscountService (RestService) {
	var discounts = RestService.all("discounts")
	return {
		build: build,
	}

	function build () {
		
	}

	// function calculate (order_items, amount, discount) {
	// 	if (discount > 100 && order_items.length !== 0) {
	// 		return discount / order_items.length 
	// 	} else {
	// 		return amount * parseFloat(discount / 100)
	// 	}
	// }
}