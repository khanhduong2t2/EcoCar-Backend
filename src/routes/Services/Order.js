const OrderRouter = require('express').Router();

const OrderController = require('../../controllers/service/Order.controller');
const Middleware = require('../../controllers/Middleware')

OrderRouter.post('/create-order', Middleware.verifyToken, OrderController.createOrder);
OrderRouter.post('/get-order-waiting', Middleware.verifyToken, OrderController.getOrderWaiting);
OrderRouter.patch('/order-pay', Middleware.verifyToken, OrderController.orderPay);
OrderRouter.post('/re-order', Middleware.verifyToken, OrderController.reOrder);

module.exports = OrderRouter;