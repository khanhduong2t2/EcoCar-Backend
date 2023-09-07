const createError = require('http-errors');
const ListProduct = require('../../models/product/list_product.model');

module.exports = {
    createItemProducts: async (req, res, next) => {
        try {
            let { name, price, link_image, type, status } = req.body;

            const isExists = await ListProduct.findOne({
                name
            });

            if (isExists) {
                throw createError.Conflict(`${name} has existed`)
            };

            const newProduct = new ListProduct({
                name, price, link_image, type, status
            });

            const savedProduct = await newProduct.save();

            return res.status(200).json({
                status: 'OK',
                elements: savedProduct
            });
        } catch (err) {
            next(err);
        }
    },

    getProductsShowHome: async (req, res, next) => {
        try {

        } catch (err) {
            next(err);
        }
    }
}