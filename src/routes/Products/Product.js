const ProductRouter = require('express').Router();
const ProductController = require('../../controllers/product/Product.controller');

ProductRouter.post('/create-new-product', ProductController.createItemProducts);

ProductRouter.get('/list-products', ProductController.getListProducts);
ProductRouter.get('/list-products/:type', ProductController.getListProductsWithType);

ProductRouter.get('/detail-product/:product_id', ProductController.getDetailProduct);

ProductRouter.get('/search-product', ProductController.searchProduct);

ProductRouter.post('/create-info-product', ProductController.createInfoProduct);
ProductRouter.get('/get-info-product/:product_id', ProductController.getInfoProduct);


module.exports = ProductRouter;