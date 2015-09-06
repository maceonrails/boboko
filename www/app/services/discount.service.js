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

	// function calculate (orderItems, amount, discount) {
	// 	if (discount > 100 && orderItems.length !== 0) {
	// 		return discount / orderItems.length 
	// 	} else {
	// 		return amount * parseFloat(discount / 100)
	// 	}
	// }
}