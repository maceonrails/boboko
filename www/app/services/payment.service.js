angular
  .module('eresto.payment.service', ['eresto.order.service', 'eresto.tax.service'])
  .factory('PaymentService', PaymentService)

function PaymentService ($q, RestService, OrderService, TaxService) {
	var sub_total;
	var tax_amount;
	var total;
	var paid_amount;
	var return_amount;
	var discount_amount;

	return {
		payOrder: payOrder,
		voidOrder: voidOrder, 
		getPaymentInfo: getPaymentInfo
	}

	function getPaymentInfo (order) {
		sub_total = getSubTotal(order)
		tax_amount = getTaxAmount(order)
		total = getTotal(order)
		paid_amount = getPaidAmount(order)
		return_amount = getReturnAmount(order)

		return {
			sub_total: sub_total || 0,
			tax_amount: tax_amount || 0,
			total: total || 0,
			paid_amount: paid_amount || 0,
			return_amount: return_amount || 0,
			discount_amount: order.discount_amount || 0
		}
	}

	function getSubTotal (order) {
		var sub_total = 0
    order.order_items.forEach(function(orderItem) {
      if (orderItem.product)
        sub_total += orderItem.quantity * orderItem.product.price;
    })
    return sub_total
	}

	function getTaxAmount (order) {
		return TaxService.calculateTax(getSubTotal(order));
	}

	function getTotal (order) {
		return getSubTotal(order) + getTaxAmount(order)
	}

	function getPaidAmount (order) {
		return getTotal(order) + order.discount_amount
	}

	function getReturnAmount (order) {
		paid_amount = getPaidAmount(order)
		return paid_amount > order.cash_amount ? 0 : paid_amount - order.cash_amount;
	}

	function payOrder (order) {
		console.log(order.name)
		return RestService.one('orders', order.id).post("pay_order", order)
	}

	function voidOrder (order, user, order_items) {
		order_items.forEach(function (orderItem) {
			orderItem.paid_amount = 0;
			orderItem.void = true;
			orderItem.void_note = order.void_note;
		})
		return order.post("void_order", {order_items: order_items}, {order_id: order.id, email: user.email, password: user.password});
	}
}