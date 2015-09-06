angular
	.module('eresto.tax.service', ['eresto.rest.service'])
	.factory('TaxService', TaxService)

function TaxService(RestService, localStorageService){
  var taxes = {
    'ppn': 0.1,
    'service': 0
  }

  RestService.all("outlets").customGET('get').then(function (res) {
    for (var i in res.outlet.taxs) {
      taxes[i] = parseFloat(res.outlet.taxs[i])
    }
  });

  return {
    build: build,
    getTotalRate: getTotalRate,
    changeTaxes: changeTaxes,
    calculateTax: calculateTax,
    getTaxes: getTaxes,
    getTax: getTax
  }

  function build () {
    return {
      total: 0,
      ppn: 0,
      service: 0
    }
  }

  function getTax(tax) {
    return taxes[tax];
  }

  function getTaxes() {
    var taxes = {}
    
    return taxes;
  }

  function getTotalRate () {
    var sum = 0;
    for(var tax in taxes) {
      sum += taxes[tax];
    }
    return sum;
  }

  function changeTaxes (new_taxes) {
    for (var i in new_taxes) {
      taxes[i] = new_taxes[i];
    }
  }

  function calculateTax (amount) {
    return getTotalRate() * amount
  }
}