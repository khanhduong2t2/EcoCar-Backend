const AuthenticationRouter = require('express').Router();

const Middleware = require('../../controllers/Middleware');
const AuthController = require('../../controllers/customer/Auth.controller')

AuthenticationRouter.post('/login', AuthController.login);
AuthenticationRouter.get('/verify', AuthController.verify);
AuthenticationRouter.post('/register', AuthController.register);
AuthenticationRouter.post('/forgot-password', AuthController.forgotPassword);
AuthenticationRouter.post('/change-password', Middleware.verifyToken, AuthController.changePassword);

AuthenticationRouter.post('/refresh-token', AuthController.refreshToken);

module.exports = AuthenticationRouter;