const ContentRouter = require('express').Router();

const ContentController = require('../../controllers/content/Content.controller')

ContentRouter.post('/create-certified', ContentController.createCertified);
ContentRouter.get('/get-list-certified', ContentController.getListCertified);

ContentRouter.post('/create-news', ContentController.createNews);
ContentRouter.get('/get-detail-news/:id', ContentController.getDetailNews);
ContentRouter.get('/get-list-news', ContentController.getListNews);

module.exports = ContentRouter;