const createError = require('http-errors');
const mongoose = require('mongoose');
const AccCusModel = require('../../models/customer/account_cus.model');
const ListCartModel = require('../../models/service/list_cart.model');
const ListProductModel = require('../../models/product/list_product.model');

const {
    error_missing
} = require('../../configs/response');

const {
    checkExistItem
} = require('../../helpers/check_exist')

module.exports = {
    addItemToCart: async (req, res, next) => {
        try {
            console.log('addItemToCart')
            let { customer_id, product_id, quantity } = req.body;
            if (!customer_id || !product_id || !quantity) {
                return res.status(400).json(error_missing("customer_id && product_id && quantity"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            // Check product
            let objProduct = { product_id };
            await checkExistItem(ListProductModel, objProduct, "Product");

            // Case: exist awaited Cart
            let card = await ListCartModel.findOne({
                customer_id, product_id, status: 'waited'
            });

            if (card) {
                // Case: Exist Cart
                card.quantity += quantity;
                await card.save();
            } else {
                // Case: new Cart
                const newCart = new ListCartModel({
                    customer_id, product_id, quantity
                });

                card = await newCart.save();
            }

            const pipeline = [
                {
                    $match: {
                        customer_id: card.customer_id,
                        _id: new mongoose.Types.ObjectId(card._id),
                        status: "waited"
                    },
                },
                {
                    $lookup: {
                        from: 'ListProducts',
                        localField: 'product_id',
                        foreignField: 'product_id',
                        as: 'productInfo',
                    },
                },
                {
                    $unwind: '$productInfo',
                },
            ];

            const result = await ListCartModel.aggregate(pipeline);

            return res.status(200).json({
                status: true,
                data: result
            })
        } catch (err) {
            next(err);
        }
    },

    getListCart: async (req, res, next) => {
        try {
            let { id } = req.params;
            if (!id) {
                return res.status(400).json(error_missing("id"))
            };

            // Check customer
            let objCustomer = { _id: id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            const pipeline = [
                {
                    $match: {
                        customer_id: id,
                        status: "waited"
                    },
                },
                {
                    $lookup: {
                        from: 'ListProducts',
                        localField: 'product_id',
                        foreignField: 'product_id',
                        as: 'productInfo',
                    },
                },
                {
                    $unwind: '$productInfo',
                },
            ];

            const result = await ListCartModel.aggregate(pipeline);

            return res.status(200).json({
                status: true,
                data: result
            })
        } catch (err) {
            next(err);
        }
    },

    removeItemCart: async (req, res, next) => {
        try {
            let { customer_id, list_id_item } = req.body;
            if (!customer_id || !list_id_item) {
                return res.status(400).json(error_missing("customer_id && list_id_item"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            const result = await ListCartModel.find({
                customer_id: customer_id,
                status: "waited",
                _id: {
                    $in: list_id_item.map(id => new mongoose.Types.ObjectId(id))
                }
            });

            result.forEach(async (item) => {
                item.status = "canceled";
                await item.save();
            })

            return res.status(200).json({
                status: true,
                data: result
            })
        } catch (err) {
            next(err);
        }
    },

    updateQuantityItem: async (req, res, next) => {
        try {
            let { customer_id, id_item, quantity } = req.body;
            if (!customer_id || !id_item || !quantity) {
                return res.status(400).json(error_missing("customer_id && id_item && quantity"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            const result = await ListCartModel.findOne({
                customer_id: customer_id,
                status: "waited",
                _id: new mongoose.Types.ObjectId(id_item)
            });
            result.quantity = quantity;
            await result.save();

            return res.status(200).json({
                status: true,
                data: result
            })
        } catch (err) {
            next(err);
        }
    },

    updateSelectedCart: async (req, res, next) => {
        try {
            let { customer_id, list_carts } = req.body;
            if (!customer_id || !list_carts || list_carts.length === 0) {
                return res.status(400).json(error_missing("customer_id && list_carts"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            let promises = list_carts.map(async (item) => {
                let cart = await ListCartModel.findOne({
                    customer_id: customer_id,
                    status: "waited",
                    _id: new mongoose.Types.ObjectId(item.id)
                });
                cart.selected = item.is_selected;
                return cart.save();
            });

            let result = await Promise.all(promises);

            return res.status(200).json({
                status: true,
                data: result
            })
        } catch (err) {
            next(err);
        }
    }
}