const CartRouter = require('express').Router();

const CartController = require('../../controllers/service/Cart.controller');
const Middleware = require('../../controllers/Middleware')

CartRouter.post('/add-new-cart', Middleware.verifyToken, CartController.addItemToCart);
CartRouter.post('/remove-item-cart', Middleware.verifyToken, CartController.removeItemCart);
CartRouter.post('/update-quantity-item', Middleware.verifyToken, CartController.updateQuantityItem);
CartRouter.patch('/update-selected-cart', Middleware.verifyToken, CartController.updateSelectedCart);

CartRouter.get('/get-list-cart/:id', Middleware.verifyToken, CartController.getListCart);

module.exports = CartRouter;