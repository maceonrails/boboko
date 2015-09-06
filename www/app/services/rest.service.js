angular
	.module('eresto.rest.service', ['restangular', 'LocalStorageModule'])
	.factory('RestService', RestService)

function RestService(Restangular, localStorageService){
  return Restangular.withConfig(function(RestangularConfigurer) {
  	RestangularConfigurer.setBaseUrl(localStorageService.get('host') || '');
    RestangularConfigurer.setDefaultHeaders({token: localStorageService.get('token')});
    RestangularConfigurer.setDefaultRequestParams({token: localStorageService.get('token')});
  });
}