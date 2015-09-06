angular
	.module('eresto.table.service', [])
	.factory('TableService', TableService)

function TableService(RestService){
  var base = RestService.all('tables');
  return {
    getAll: getAll,
  }

  function getAll() {
    return base.getList().then(function (tables) {
      return tables;
    })
  }
}