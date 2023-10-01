const createError = require('http-errors');

const { error_missing } = require('../../configs/response');
const { checkExistItem } = require('../../helpers/check_exist');

const ListOrderModel = require('../../models/service/list_order.model');
const AccountCustomer = require('../../models/customer/account_cus.model');

module.exports = {
    getInfoUser: async (req, res, next) => {
        try {
            let { customer_id } = req.body;

            if (!customer_id) {
                return res.status(400).json(error_missing("customer_id"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccountCustomer, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            return res.status(200).json({
                status: true,
                data: {
                    email: customer.email,
                    username: customer.username,
                    phone: customer.phone ? customer.phone : "",
                    address: customer.address ? customer.address : ""
                }
            })

        } catch (err) {
            next(err);
        }
    },

    updateInfoUser: async (req, res, next) => {
        try {
            let { customer_id, phone, address } = req.body;

            if (!customer_id) {
                return res.status(400).json(error_missing("customer_id"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            let customer = await checkExistItem(AccountCustomer, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            customer.phone = phone;
            customer.address = address;
            await customer.save();


            return res.status(200).json({
                status: true,
                data: {
                    email: customer.email,
                    username: customer.username,
                    phone: customer.phone ? customer.phone : "",
                    address: customer.address ? customer.address : ""
                }
            })

        } catch (err) {
            next(err);
        }
    },

    getSuggestAddress: async (req, res, next) => {
        try {
            let { customer_id } = req.body;

            if (!customer_id) {
                return res.status(400).json(error_missing("customer_id"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccountCustomer, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            let requestAddress = {};
            let listOldOrders = await ListOrderModel.find({
                customer_id: customer._id
            }).sort('-createdAt');

            if (listOldOrders.length > 0) {
                requestAddress = {
                    address: listOldOrders[0].address,
                    phone: listOldOrders[0].phone
                }
            } else {
                requestAddress = {
                    address: customer.address,
                    phone: customer.phone
                }
            }

            return res.status(200).json({
                status: true,
                data: requestAddress
            })

        } catch (err) {
            next(err);
        }
    },
};
