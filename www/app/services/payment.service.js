angular
  .module('eresto.payment.service', ['eresto.order.service', 'eresto.tax.service'])
  .factory('PaymentService', PaymentService)

function PaymentService ($q, RestService, OrderService, TaxService) {
	var subTotal;
	var taxTotal;
	var total;
	var paidAmount;
	var returnAmount;
	var discountAmount;

	return {
		payOrder: payOrder,
		voidOrder: voidOrder, 
		getPaymentInfo: getPaymentInfo
	}

	function getPaymentInfo (order) {
		subTotal = getSubTotal(order)
		taxTotal = getTaxTotal(order)
		total = getTotal(order)
		paidAmount = getPaidAmount(order)
		returnAmount = getReturnAmount(order)

		return {
			subTotal: subTotal || 0,
			taxTotal: taxTotal || 0,
			total: total || 0,
			paidAmount: paidAmount || 0,
			returnAmount: returnAmount || 0,
			discountAmount: order.discountAmount || 0
		}
	}

	function getSubTotal (order) {
		var subTotal = 0
    order.orderItems.forEach(function(orderItem) {
      if (orderItem.product)
        subTotal += orderItem.quantity * orderItem.product.price;
    })
    return subTotal
	}

	function getTaxTotal (order) {
		return TaxService.calculateTax(getSubTotal(order));
	}

	function getTotal (order) {
		return getSubTotal(order) + getTaxTotal(order)
	}

	function getPaidAmount (order) {
		return getTotal(order) + order.amountDiscount
	}

	function getReturnAmount (order) {
		paidAmount = getPaidAmount(order)
		return paidAmount > order.cashAmount ? 0 : paidAmount - order.cashAmount;
	}

	function payOrder (order) {
		order.paid = true;
		order.orderItems.forEach(function (orderItem) {
			orderItem.paid = true;
		})
		return OrderService.saveOrder(order);
	}

	function voidOrder (order) {
		order.void = true;
		order.orderItems.forEach(function (orderItem) {
			orderItem.paid_amount = 0;
			orderItem.void = true;
		})
		return OrderService.saveOrder(order);
	}
}