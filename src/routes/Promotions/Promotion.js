const PromotionRouter = require('express').Router();

const PromotionController = require('../../controllers/promotion/Promotion.controller');
const Middleware = require('../../controllers/Middleware')

PromotionRouter.post('/create-promotion', PromotionController.createNewPromotion);
PromotionRouter.post('/list-promotion-except', Middleware.verifyToken, PromotionController.getListPromotionExcept);

module.exports = PromotionRouter;