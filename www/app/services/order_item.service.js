angular
  .module('eresto.orderItem.service', ['eresto.rest.service', 'eresto.tax.service'])
  .factory('OrderItemService', OrderItemService)

function OrderItemService(RestService, TaxService){
  base = RestService.all('order_items')

  return {

  }

  function subTotal (orderItem) {
    return orderItem.product.price * orderItem.quantity
  }

  function total (orderItem) {
    subTotal = subTotal(orderItem)
    return subTotal + TaxService.calculateTax(subTotal)
  }
}