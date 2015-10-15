angular
	.module('eresto.tax.service', [])
	.factory('TaxService', TaxService)

function TaxService(Restangular, localStorageService){
  var taxes = {}

  Restangular.all("outlets").customGET('get').then(function (res) {
    for (var i in res.outlet.taxs) {
      taxes[i] = parseFloat(res.outlet.taxs[i]) / 100
    }
  });

  return {
    build: build,
    getTotalRate: getTotalRate,
    changeTaxes: changeTaxes,
    calculateTax: calculateTax,
    getTaxes: getTaxes,
    getTax: getTax,
    taxes: taxes
  }

  function build () {
    return {
      total: 0,
      ppn: 0,
      service: 0
    }
  }

  function getTaxes () {
    return Restangular.all("outlets").customGET('get').then(function (res) {
      return res.outlet.taxs
    });
  }
  

  function getTax(tax) {
    return taxes[tax];
  }

  function getTotalRate (taxes) {
    var sum = 0.0;
    for(var tax in taxes) {
      sum += parseFloat(taxes[tax]);
    }
    return sum;
  }

  function changeTaxes (new_taxes) {
    for (var i in new_taxes) {
      taxes[i] = new_taxes[i];
    }
  }

  function calculateTax (amount, taxes) {
    return getTotalRate(taxes)/100 * amount
  }
}