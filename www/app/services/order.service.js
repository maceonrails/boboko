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
    reprintOrder: reprintOrder,
    printSplitOrder: printSplitOrder,
    getTotal: getTotal,
    getPaidAmount: getPaidAmount, 
    getReturnAmount: getReturnAmount,
    addMenu: addMenu, 
    moveFromBox: moveFromBox,
    moveToBox: moveToBox,
    // cancelSplit: cancelSplit,
    cancelMove: cancelMove,
    voidOrder: voidOrder,
    ocOrder: ocOrder,
    getHistoryOrders: getHistoryOrders,
    getDiscountAmount: getDiscountAmount,
  }

  function addMenu (product, order) {
    var orderItem = Restangular.one('order_items');
    orderItem.product_id = product.id;
    orderItem.product = {}
    orderItem.product.choices = product.choices
    orderItem.product.discounts = product.discounts
    orderItem.order_id = order.id;
    orderItem.name = product.name;
    orderItem.picture = product.picture;
    orderItem.quantity = 1;
    orderItem.pay_quantity = 0;
    orderItem.paid_quantity = 0;
    orderItem.printed_quantity = 0;
    orderItem.oc_quantity = 0;
    orderItem.void_quantity = 0;
    orderItem.take_away = true;
    orderItem.paid_amount = orderItem.quantity * product.price;
    orderItem.default_price = product.price;
    orderItem.price = product.price;
    var sameItem = false;

    if (product.discounts.length > 0) {
      var discount = _.max(product.discounts, function (discount) { return discount.amount; });
      orderItem.discount_id = discount.id
      orderItem.price = orderItem.default_price - discount.amount
    }

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

    console.log(order)

    return order;
  }

  function moveToBox (item, order, move_order) {
    var sameItem = false
    move_order.order_items.forEach(function (orderItem) {
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
      move_order.order_items.push(item)
      console.log('move to box', item)
      if (item.quantity == 0) {
        _.remove(order.order_items, {
          product_id: item.product_id
        });
      }
    }
    console.log(item.pay_quantity)
  }

  function moveFromBox (item, move_order, order) {
    var sameItem = false
    order.order_items.forEach(function (orderItem) {
      if (orderItem === item) {
        item.pay_quantity--
        item.quantity++
        console.log('move to box same item', item)
        if (item.pay_quantity == 0) {
          _.remove(move_order.order_items, {
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
        _.remove(move_order.order_items, {
          product_id: item.product_id
        });
      }
    }
    console.log(item.pay_quantity)
  }

  function cancelMove (order, move_order) {
    var sameItem = false
    move_order.order_items.forEach(function (item) {
      order.order_items.forEach(function (orderItem) {
        if (item === orderItem) {
          orderItem.quantity += orderItem.pay_quantity
          orderItem.pay_quantity = 0
          sameItem = true
        }
      })
      if (!sameItem) {
        item.quantity += item.pay_quantity
        item.pay_quantity = 0
        order.order_items.push(item)
      }
    })
    move_order.order_items = [];
  }

  function moveItem (item, fromOrder, toOrder) {

  }

  function changeItem (order) {
    // body...
  }

  function saveOrder (order) {
    order.cashier_id = AuthService.id();
    return order.post("make_order", order)
  }

  function printOrder (order) {
    order.order_items.forEach(function (orderItem) {
      orderItem.print_quantity = orderItem.quantity - orderItem.paid_quantity
    })
    return saveAndPrint(order)
  }

  function reprintOrder (order) {
    order.order_items.forEach(function (orderItem) {
      orderItem.print_quantity = orderItem.paid_quantity
    })
    return Restangular.one('orders', order.id).post("print_order", order)
  }

  function printSplitOrder (order) {
    order.order_items.forEach(function (orderItem) {
      orderItem.print_quantity = orderItem.pay_quantity
    })
    return saveAndPrint(order)
  }

  function saveAndPrint (order) {
    order.cashier_id = AuthService.id();
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
        if (order.type === 'move')
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
      if (order.type === 'move')
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
    var result = getTotal(order) - order.total_discount;
    return result
  }

  function getDiscountAmount (order) {
    var discount_products = 0
    order.order_items.forEach(function (order_item) {
      if (order.waiting == false) {
        quantity = order_item.paid_quantity
      } else if (order.type === 'move') {
        quantity = order_item.pay_quantity
      } else {
        quantity = order_item.quantity - order_item.paid_quantity - order_item.void_quantity - order_item.oc_quantity
      }
      
      discount_products += (order_item.default_price - order_item.price) * quantity
    })
    console.log(order.discount_amount)
    order.total_discount = (parseInt(order.discount_amount) || 0) + discount_products
    return order.total_discount
  }

  function getReturnAmount (order) {
    var paid_amount = getPaidAmount(order)
    var result = paid_amount > order.cash_amount ? 0 : order.cash_amount - paid_amount;
    return result
  }

  function getWaitingOrders (query) {
    return base.customGET("waiting_orders", {q: query}).then(function (orders) {
      return orders;
    })
  }

  function getHistoryOrders (params) {
    return base.customGET("history_orders", params).then(function (orders) {
      return orders;
    })
  }

  function create(order) {
    order.cashier_id = AuthService.id();
    order.servant_id = AuthService.id();
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

  function voidOrder (order, user) {
    return Restangular.one('orders', order.id).post(
      "void_order", 
      {order_items: order.order_items}, 
      {order_id: order.id, email: user.email, password: user.password, note: user.note}
    )
  }

  function ocOrder (order, user) {
    return Restangular.one('orders', order.id).post(
      "oc_order", 
      {order_items: order.order_items}, 
      {order_id: order.id, email: user.email, password: user.password, note: user.note}
    )
  }

}