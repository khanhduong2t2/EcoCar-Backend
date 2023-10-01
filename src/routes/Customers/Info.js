const InfoRouter = require('express').Router();

const Middleware = require('../../controllers/Middleware');
const InfoController = require('../../controllers/customer/Info.controller');

InfoRouter.post('/get-info', Middleware.verifyToken, InfoController.getInfoUser);
InfoRouter.post('/update-info', Middleware.verifyToken, InfoController.updateInfoUser);
InfoRouter.post('/get-suggest-address', Middleware.verifyToken, InfoController.getSuggestAddress);

module.exports = InfoRouter;