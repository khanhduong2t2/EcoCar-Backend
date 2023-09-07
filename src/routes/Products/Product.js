const ProductRouter = require('express').Router();

const ProductController = require('../../controllers/product/Product.controller');

ProductRouter.post('/create-new-product', ProductController.createItemProducts);

ProductRouter.get('/list-products', ProductController.getProductsShowHome);

module.exports = ProductRouter;