angular
  .module('eresto.orderItem.service', ['eresto.tax.service'])
  .factory('order_itemservice', order_itemservice)

function order_itemservice(Restangular, TaxService){
  base = Restangular.all('order_items')

  return {

  }

  function sub_total (orderItem) {
    return orderItem.product.price * orderItem.quantity
  }

  function total (orderItem) {
    sub_total = sub_total(orderItem)
    return sub_total + TaxService.calculateTax(sub_total)
  }
}