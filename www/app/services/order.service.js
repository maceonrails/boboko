angular
  .module('eresto.order.service', ['eresto.tax.service'])
  .factory('OrderService', OrderService)

function OrderService(Restangular, TaxService, $q, AuthService){
  var base = Restangular.all('orders');
  return {
    getWaitingOrders: getWaitingOrders,
    create: create,
    find: find,
    getSubTotal: getSubTotal,
    createOrderItems: createOrderItems,
    getActiveItems: getActiveItems,
    payAll: payAll,
    saveOrder: saveOrder,
    printOrder: printOrder,
    getTotal: getTotal,
    getPaidAmount: getPaidAmount, 
    getReturnAmount: getReturnAmount,
    addMenu: addMenu, 
    moveFromSplit: moveFromSplit,
    moveToSplit: moveToSplit,
    cancelSplit: cancelSplit
  }

  function addMenu (product, order) {
    var orderItem = Restangular.one('order_items');
    orderItem.product_id = product.id;
    orderItem.product = {}
    orderItem.product.choices = product.choices
    orderItem.order_id = order.id;
    orderItem.price = product.price;
    orderItem.name = product.name;
    orderItem.picture = product.picture;
    orderItem.quantity = 1;
    orderItem.pay_quantity = 0;
    orderItem.paid_quantity = 0;
    orderItem.printed_quantity = 0;
    orderItem.paid_amount = orderItem.quantity * product.price;
    var sameItem = false;

    order.order_items.forEach(function (orderItem) {
      if (orderItem.product_id === product.id) {
        sameItem = true;
        orderItem.quantity++;
      } 
    })

    if (order.order_items.length === 0 || !sameItem) {
      order.order_items.push(orderItem);
    }

    orderItem.sub_total = (orderItem.quantity * product.price);
    orderItem.tax_amount = TaxService.calculateTax(orderItem.sub_total);
    orderItem.paid_amount = (orderItem.quantity * product.price) + orderItem.tax_amount;

    return order;
  }

  function moveToSplit (item, order, split_order) {
    var sameItem = false
    split_order.order_items.forEach(function (orderItem) {
      if (orderItem === item) {
        item.pay_quantity++
        item.quantity--
        if (item.quantity == 0) {
          _.remove(order.order_items, {
            product_id: item.product_id
          });
        }
        sameItem = true
      } 
    })
    if (!sameItem) {
      item.quantity--
      item.pay_quantity++
      split_order.order_items.push(item)
      console.log('move to split', item)
      if (item.quantity == 0) {
        _.remove(order.order_items, {
          product_id: item.product_id
        });
      }
    }
  }

  function moveFromSplit (item, split_order, order) {
    var sameItem = false
    order.order_items.forEach(function (orderItem) {
      if (orderItem === item) {
        item.pay_quantity--
        item.quantity++
        console.log('move to split same item', item)
        if (item.pay_quantity == 0) {
          _.remove(split_order.order_items, {
            product_id: item.product_id
          });
        }
        sameItem = true
      } 
    })
    if (!sameItem) {
      item.quantity++
      item.pay_quantity--
      order.order_items.push(item)
      console.log('move from split', item)
      if (item.pay_quantity == 0) {
        _.remove(split_order.order_items, {
          product_id: item.product_id
        });
      }
    }
  }

  function cancelSplit (order, split_order) {
    var sameItem = false
    split_order.order_items.forEach(function (splitItem) {
      order.order_items.forEach(function (orderItem) {
        if (splitItem === orderItem) {
          orderItem.quantity += orderItem.pay_quantity
          orderItem.pay_quantity = 0
          sameItem = true
        }
      })
      if (!sameItem) {
        splitItem.quantity += splitItem.pay_quantity
        splitItem.pay_quantity = 0
        order.order_items.push(splitItem)
      }
    })
    split_order.order_items = [];
  }

  function moveItem (item, fromOrder, toOrder) {

  }

  function changeItem (order) {
    // body...
  }

  function saveOrder (order) {
    return order.post("make_order", order)
  }

  function printOrder (order, type) {
    order.order_items.forEach(function (orderItem) {
      if (type == 'split') {
        orderItem.print_quantity = orderItem.pay_quantity
      } else {
        orderItem.print_quantity = orderItem.quantity - orderItem.paid_quantity
      }
    })

    return Restangular.one('orders', order.id).post("make_order", order).then(function (res) {
      return Restangular.one('orders', order.id).post("print_order", order)
    })
  }

  function calculate (order, discount_amount) {
    var sub_total = getSubTotal(order)
    var tax_amount = TaxService.calculateTax(sub_total)
    var total = sub_total + tax_amount
    var paid_amount = total - discount_amount
    var ppnTax = TaxService.getPpnTax(sub_total)
    var serviceTax = TaxService.getServiceTax(sub_total)

    return {
      sub_total: sub_total,
      tax_amount: tax_amount,
      total: total,
      paid_amount: paid_amount,
      taxes: {
        'ppn': ppnTax,
        'service': serviceTax
      }
    }
  }

  function getSubTotal (order) {
    var sub_total = 0
    order.order_items.forEach(function(orderItem) {
      if (orderItem.product_id)
        if (order.type === 'split')
          sub_total += orderItem.pay_quantity * orderItem.price;
        else if (order.type === 'void')
          sub_total += orderItem.void_quantity * orderItem.price;
        else
          sub_total += orderItem.quantity * orderItem.price;
      else
        sub_total += 0;
    })
    return sub_total;
  }

  function getItemSubTotal (order, orderItem) {
    if (orderItem.product_id)
      if (order.type === 'split')
        return orderItem.pay_quantity * orderItem.price;
      else if (order.type === 'void')
        return orderItem.void_quantity * orderItem.price;
      else
        return orderItem.quantity * orderItem.price;
    else
      return 0;
  }

  function getTaxAmount (order) {
    return TaxService.calculateTax(getSubTotal(order));
  }

  function getTax (tax) {
    return Restangular.one('outlets').customGET('get').then(function (res) {
      result = res.outlet.taxs
      return {
        ppn: result.ppn || 0.1,
        service: result.service || 0.05
      }
    })
  }

  function getTotal (order) {
    var result = getSubTotal(order) + getTaxAmount(order);
    return result
  }

  function getPaidAmount (order) {
    var result = getTotal(order) - order.discount_amount;
    return result
  }

  function getReturnAmount (order) {
    var paid_amount = getPaidAmount(order)
    var result = paid_amount > order.cash_amount ? 0 : order.cash_amount - paid_amount;
    return result
  }

  function getWaitingOrders () {
    return base.customGET("waiting_orders").then(function (orders) {
      return orders;
    })
  }

  function create(order) {
    order.cashier_id = AuthService.id();
    return base.post({order: order}).then(function (order) {
      return order;
    });
  }

  function find(id) {
    return base.get(id).then(function (order) {
      return order;
    });
  }


  function createOrderItems (order_items) {
    order_items.forEach(function (orderItem) {
      base.post('order_items', orderItem).then(function (orderItem) {
        return OrderItem;
      })
    })
  }

  function getActiveItems (order) {
    return order.customGET('order_items/active_items').then(function (order_items) {
      return order_items;
    })
  }

  function payAll (order, order_items) {
    return order.customPOST({order_id: order.id, order_items: order_items}, "pay", {}, {}).then(function (result) {
      return order;
    }, function (error) {
      return error;
    })
  }
}