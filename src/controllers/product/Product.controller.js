const createError = require('http-errors');
const ListProduct = require('../../models/product/list_product.model');

module.exports = {
    createItemProducts: async (req, res, next) => {
        try {
            let { name, price, link_image, type, status } = req.body;

            let slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

            const isExists = await ListProduct.findOne({
                name
            });

            if (isExists) {
                throw createError.Conflict(`${name} has existed`)
            };

            const newProduct = new ListProduct({
                name, price, link_image, type, status, slug
            });

            const savedProduct = await newProduct.save();

            return res.status(200).json({
                status: true,
                elements: savedProduct
            });
        } catch (err) {
            next(err);
        }
    },

    getListProducts: async (req, res, next) => {
        try {

            const pipeline = [
                {
                    $group: {
                        _id: '$type',
                        list_item: { $push: '$$ROOT' },
                    },
                },
            ];
            const listProducts = await ListProduct.aggregate(pipeline);

            return res.status(200).json({
                status: true,
                data: listProducts
            })
        } catch (err) {
            next(err);
        }
    },

    getDetailProduct: async (req, res, next) => {
        try {
            let { slug } = req.params;
            const detailProduct = await ListProduct.findOne({
                slug
            });

            return res.status(200).json({
                status: true,
                data: detailProduct
            })
        } catch (err) {
            next(err);
        }
    },
}