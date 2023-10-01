const createError = require('http-errors');
const AccCusModel = require('../../models/customer/account_cus.model');
const ListPromotionModel = require('../../models/promotion/list_promotion.model');

const {
    error_missing
} = require('../../configs/response');

const {
    checkExistItem
} = require('../../helpers/check_exist');
const PromotionStatusEnum = require('../../models/enums/promotion_status.model');

module.exports = {
    createNewPromotion: async (req, res, next) => {
        try {
            let { name, code, value, type_value } = req.body;

            if (!name || !code || !value || !type_value) {
                return res.status(400).json(error_missing("name && code && value && type_value"))
            };

            let newPromotion = new ListPromotionModel({
                name, code, value, type_value
            });
            await newPromotion.save()
                .catch((err) => {
                    return res.status(500).json({
                        status: false,
                        errMessage: err.message
                    })
                })

            return res.status(200).json({
                status: true,
                data: newPromotion
            })
        } catch (err) {
            console.log('error: ', err)
            next(err);
        }
    },

    getListPromotionExcept: async (req, res, next) => {
        try {
            let { customer_id } = req.body;
            if (!customer_id) {
                return res.status(400).json(error_missing("customer_id"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            let listPromotions = await ListPromotionModel.find({
                status: PromotionStatusEnum.EXCEPT
            });

            return res.status(200).json({
                status: true,
                data: listPromotions
            })

        } catch (err) {
            next(err);
        }
    }
}