const createError = require('http-errors');
const mongoose = require('mongoose');
const AccCusModel = require('../../models/customer/account_cus.model');
const ListProductModel = require('../../models/product/list_product.model');
const FeedbackPublicModel = require('../../models/feedback/feedback_public.model');

const {
    error_missing
} = require('../../configs/response');

const {
    checkExistItem
} = require('../../helpers/check_exist')

module.exports = {
    createFeedbackPublic: async (req, res, next) => {
        try {
            let { customer_id, product_id, number_star, content } = req.body;
            if (!customer_id || !product_id || !number_star) {
                return res.status(400).json(error_missing("customer_id && product_id && number_star"))
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

            let newFeedback = new FeedbackPublicModel({
                customer_id, product_id, number_star, content
            });

            await newFeedback.save();

            return res.status(200).json({
                status: true,
                data: newFeedback
            })
        } catch (err) {
            next(err);
        }
    },

    getFeedbackPublic: async (req, res, next) => {
        try {
            let { customer_id, product_id } = req.body;

            if (!customer_id || !product_id) {
                return res.status(400).json(error_missing("customer_id && product_id"))
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

            const pipeline = [
                {
                    $match: {
                        product_id: product_id,
                    },
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $lookup: {
                        from: 'AccountCustomers',
                        localField: 'customer_id',
                        foreignField: '_id',
                        as: 'cusInfo',
                    },
                },
                // {
                //     $unwind: '$cusInfo',
                // },
            ];

            let listPublic = await FeedbackPublicModel.aggregate(pipeline);

            listPublic.sort((itemA, itemB) => {
                if (itemA.customer_id.toString() === customer_id && itemB.customer_id.toString() !== customer_id) {
                    return -1;
                } else if (itemA.customer_id.toString() !== customer_id && itemB.customer_id.toString() === customer_id) {
                    return 1;
                }
                return 0;
            })

            return res.status(200).json({
                status: true,
                data: listPublic
            })
        } catch (err) {
            next(err);
        }
    }
}