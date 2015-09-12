angular
	.module('eresto.rest.service', ['restangular', 'LocalStorageModule'])
	.factory('RestService', RestService)

function RestService(Restangular, localStorageService, TOKEN_KEY){
  return Restangular.withConfig(function(RestangularConfigurer) {
  	RestangularConfigurer.setBaseUrl(localStorageService.get('host') || '');
    // RestangularConfigurer.setDefaultHeaders({token: localStorageService.get(TOKEN_KEY)});
    // RestangularConfigurer.setDefaultRequestParams({token: localStorageService.get(TOKEN_KEY)});
  });
}