const createError = require('http-errors');
const mongoose = require('mongoose');

const CartModel = require('../../models/service/list_cart.model');
const AccCusModel = require('../../models/customer/account_cus.model');
const ProductModel = require('../../models/product/list_product.model');
const ListOrderModel = require('../../models/service/list_order.model');
const OrderStatusEnum = require('../../models/enums/order_status.model');
const PaymentTypeEnum = require('../../models/enums/payment_type.model');
const PaymentStatusEnum = require('../../models/enums/payment_status.model');
const DeliveryStatusEnum = require('../../models/enums/delivery_status.model');

const {
    error_missing
} = require('../../configs/response');

const {
    checkExistItem
} = require('../../helpers/check_exist');

const Helper = {
    addInfoForCart: async (order) => {
        let list_carts = order.list_carts;
        for (let i = 0; i < list_carts.length; i++) {
            let cart = await CartModel.findOne({
                _id: list_carts[i].id
            })
            let product = await ProductModel.findOne({
                product_id: cart.product_id
            });
            if (product) {
                list_carts[i].product_id = product.product_id;
                list_carts[i].name = product.name;
                list_carts[i].price = product.price;
                list_carts[i].link_image = product.link_image;
                list_carts[i].type = product.type;
            } else {
                order.order_status = OrderStatusEnum.ERROR;
                await order.save();
                break;
            }
        }
        order.list_carts = list_carts;
    }
}

module.exports = {
    getListPurchase: async (req, res, next) => {
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
            const pipeline = [
                {
                    $match: {
                        customer_id: customer_id,
                        payment_status: {
                            $in: [PaymentStatusEnum.PAID, PaymentStatusEnum.UNPAID]
                        },
                        payment_type: {
                            $in: [PaymentTypeEnum.CASH, PaymentTypeEnum.TRANSFER]
                        },
                        delivery_status: {
                            $in: [DeliveryStatusEnum.UNDELIVERY, DeliveryStatusEnum.PREPARING, DeliveryStatusEnum.DELIVERING, DeliveryStatusEnum.DELIVERED]
                        },
                        order_status: {
                            $in: [OrderStatusEnum.CANCELED, OrderStatusEnum.PROCESSING, OrderStatusEnum.SUCCEED]
                        }
                    },
                },
            ];

            let listPurchases = await ListOrderModel.aggregate(pipeline);

            for (let i = 0; i < listPurchases.length; i++) {
                await Helper.addInfoForCart(listPurchases[i]);
            }

            return res.status(200).json({
                status: true,
                data: listPurchases
            })
        } catch (err) {
            next(err);
        }
    },

    cancelPurchase: async (req, res, next) => {
        try {
            let { customer_id, purchase_id } = req.body;
            let { lang } = req.headers;
            if (!customer_id || !purchase_id) {
                return res.status(400).json(error_missing("customer_id && purchase_id"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            let purchase = await ListOrderModel.findOne({
                customer_id,
                _id: new mongoose.Types.ObjectId(purchase_id)
            })

            if (purchase && purchase.delivery_status === DeliveryStatusEnum.DELIVERING) {
                return res.status(200).json({
                    status: false,
                    message: lang === "en"
                        ? "Order is in transit. If you want to CANCEL, please contact the hotline !"
                        : "Đơn hàng đang trong quá trình vận chuyển. Nếu bạn muốn HỦY, xin hãy liên hệ tổng đài !"
                })
            }

            if (purchase && purchase.payment_status === PaymentStatusEnum.PAID) {
                purchase.order_status = OrderStatusEnum.CANCELED;
                await purchase.save();

                return res.status(200).json({
                    status: true,
                    data: purchase,
                    message: lang === "en"
                        ? "The order has been successfully CANCELED.We will contact you and make a refund !"
                        : "Đơn hàng được HỦY thành công. Chúng tôi sẽ liên hệ và thực hiện hoàn trả chi phí !"
                })
            }

            purchase.order_status = OrderStatusEnum.CANCELED;
            await purchase.save();

            await Helper.addInfoForCart(purchase);

            return res.status(200).json({
                status: true,
                data: purchase,
                message: lang === "en"
                    ? "The order has been successfully CANCELED !"
                    : "Đơn hàng được HỦY thành công !"
            })
        } catch (err) {
            next(err);
        }
    },

    feedbackPurchase: async (req, res, next) => {
        try {
            let { customer_id, purchase_id, feedback } = req.body;
            let { lang } = req.headers;
            if (!customer_id || !purchase_id || !feedback) {
                return res.status(400).json(error_missing("customer_id && purchase_id && feedback"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            let purchase = await ListOrderModel.findOne({
                customer_id,
                _id: new mongoose.Types.ObjectId(purchase_id)
            })

            purchase.feedback = feedback;
            await purchase.save();

            await Helper.addInfoForCart(purchase);

            return res.status(200).json({
                status: true,
                data: purchase,
                message: lang === "en"
                    ? "Thank you for your feedback !"
                    : "Cảm ơn bạn đã đánh giá!"
            })
        } catch (err) {
            next(err);
        }
    }
}