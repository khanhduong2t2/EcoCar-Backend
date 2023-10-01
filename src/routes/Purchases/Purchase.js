const PurchaseRouter = require('express').Router();

const PurchaseController = require('../../controllers/purchase/Purchase.controller');
const Middleware = require('../../controllers/Middleware')

PurchaseRouter.post('/get-list-purchase', Middleware.verifyToken, PurchaseController.getListPurchase);
PurchaseRouter.post('/cancel-purchase', Middleware.verifyToken, PurchaseController.cancelPurchase);
PurchaseRouter.post('/feedback-purchase', Middleware.verifyToken, PurchaseController.feedbackPurchase);

module.exports = PurchaseRouter;