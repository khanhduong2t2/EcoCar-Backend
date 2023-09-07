const AuthenticationRouter = require('express').Router();

const AuthController = require('../../controllers/customer/Auth.controller')

AuthenticationRouter.post('/register', AuthController.register);
AuthenticationRouter.post('/login', AuthController.login);
AuthenticationRouter.get('/test-data', AuthController.testData);

module.exports = AuthenticationRouter;