angular
	.module('eresto.constants', [])
	.constant('AUTH_EVENTS', {
	  notAuthenticated: 'auth-not-authenticated',
	  notAuthorized: 'auth-not-authorized',
	  notFoundHost: 'host-not-found',
	  badRequest: 'bad-request',
	})

	.constant('USER_ROLES', {
		manager: 'manager',
	  captain: 'captain',
	  cashier: 'cashier',
	})

	.constant('TOKEN_KEY', 'eresto')
