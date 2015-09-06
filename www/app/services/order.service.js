angular
  .module('eresto.order.service', ['eresto.rest.service', 'eresto.tax.service'])
  .factory('OrderService', OrderService)

function OrderService(RestService, TaxService, $q){
  var base = RestService.all('orders');
  return {
    getWaitingOrders: getWaitingOrders,
    create: create,
    find: find,
    getSubTotal: getSubTotal,
    createOrderItems: createOrderItems,
    getOrderItems: getOrderItems,
    payAll: payAll,
    saveOrder: saveOrder,
    getTotal: getTotal,
    getPaidAmount: getPaidAmount, 
    getReturnAmount: getReturnAmount,
    addMenu: addMenu
  }

  function addMenu (product, order) {
    var orderItem = RestService.one('order_items');
    orderItem.quantity = 1;
    orderItem.product_id = product.id;
    orderItem.order_id = order.id;
    orderItem.product = product;
    orderItem.paid_amount = orderItem.quantity * product.price;
    var sameItem = false;

    order.orderItems.forEach(function (orderItem) {
      if (orderItem.product.id === product.id) {
        sameItem = true;
        orderItem.quantity++;
      } 
    })

    if (order.orderItems.length === 0 || !sameItem) {
      order.orderItems.push(orderItem);
    }

    orderItem.sub_total = (orderItem.quantity * product.price);
    orderItem.tax_amount = TaxService.calculateTax(orderItem.sub_total);
    orderItem.paid_amount = (orderItem.quantity * product.price) + orderItem.tax_amount;

    return order;
  }

  function changeItem (order) {
    // body...
  }

  function saveOrder (order) {
    return $q( function(resolve, reject) {
      order.orderItems.forEach(function (orderItem) {
        if (!orderItem.id) {
          var promise = order.post('order_items', {order_item: orderItem});
        } else {
          var promise = RestService.one('order_items', orderItem.id).customPUT({order_item: orderItem});
        }
        
        promise.then(function (res) {
          console.log(res);
          resolve(order);
        }, function (res) {
          console.log(res);
          reject(order);
        });
      })
    })
  }

  function calculate (order, discountAmount) {
    var subTotal = getSubTotal(order)
    var taxTotal = TaxService.calculateTax(subTotal)
    var total = subTotal + taxTotal
    var paidAmount = total - discountAmount
    var ppnTax = TaxService.getPpnTax(subTotal)
    var serviceTax = TaxService.getServiceTax(subTotal)

    return {
      subTotal: subTotal,
      taxTotal: taxTotal,
      total: total,
      paidAmount: paidAmount,
      taxes: {
        'ppn': ppnTax,
        'service': serviceTax
      }
    }
  }

  function getSubTotal (order) {
    var subTotal = 0
    order.orderItems.forEach(function(orderItem) {
      subTotal += getItemSubTotal(orderItem)
    })
    return subTotal;
  }

  function getItemSubTotal (orderItem) {
    if (orderItem.product)
      return orderItem.quantity * orderItem.product.price;
    else
      return 0;
  }

  function getTaxTotal (order) {
    return TaxService.calculateTax(getSubTotal(order));
  }

  function getTax (tax) {
    return RestService.one('outlets').customGET('get').then(function (res) {
      result = res.outlet.taxs
      return {
        ppn: result.ppn || 0.1,
        service: result.service || 0.05
      }
    })
  }

  function getTotal (order) {
    return getSubTotal(order) + getTaxTotal(order);
  }

  function getPaidAmount (order) {
    return getTotal(order) + order.discountAmount;
  }

  function getReturnAmount (order) {
    paidAmount = getPaidAmount(order)
    return paidAmount > order.cashAmount ? 0 : order.cashAmount - paidAmount;
  }

  function getWaitingOrders () {
    return base.getList({waiting: true}).then(function (orders) {
      return orders;
    })
  }

  function create(order) {
    return base.post({order: order}).then(function (order) {
      return order;
    });
  }

  function find(id) {
    return base.get(id).then(function (order) {
      return order;
    });
  }


  function createOrderItems (orderItems) {
    orderItems.forEach(function (orderItem) {
      base.post('order_items', orderItem).then(function (orderItem) {
        return OrderItem;
      })
    })
  }

  function getOrderItems (order) {
    return order.getList('order_items', {paid: false}).then(function (orderItems) {
      return orderItems;
    })
  }

  function payAll (order, orderItems) {
    return order.customPOST({order_id: order.id, order_items: orderItems}, "pay", {}, {}).then(function (result) {
      return order;
    }, function (error) {
      return error;
    })
  }
}