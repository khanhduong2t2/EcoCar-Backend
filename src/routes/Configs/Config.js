const ConfigRouter = require('express').Router();

const ConfigController = require('../../controllers/config/Config.controller');

ConfigRouter.get('/paypal', ConfigController.getPaypalClientId);

module.exports = ConfigRouter;