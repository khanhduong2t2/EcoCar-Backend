const moment = require('moment');
const mongoose = require('mongoose');
const createError = require('http-errors');

const CartModel = require('../../models/service/list_cart.model');
const AccCusModel = require('../../models/customer/account_cus.model');
const ProductModel = require('../../models/product/list_product.model');
const ListOrderModel = require('../../models/service/list_order.model');

const CartStatusEnum = require('../../models/enums/cart_status.model');
const OrderStatusEnum = require('../../models/enums/order_status.model');
const PaymentTypeEnum = require('../../models/enums/payment_type.model');
const PaymentStatusEnum = require('../../models/enums/payment_status.model');
const DeliveryStatusEnum = require('../../models/enums/delivery_status.model');

const {
    error_missing
} = require('../../configs/response');

const {
    checkExistItem
} = require('../../helpers/check_exist')

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
    createOrder: async (req, res, next) => {
        try {
            let { customer_id, list_carts, cost, code_promotion, total_price, address, phone } = req.body;

            if (!customer_id || !list_carts || !cost || !address || !phone) {
                return res.status(400).json(error_missing("customer_id && cost && list_carts && address && phone"))
            };

            if (!Array.isArray(list_carts) || list_carts.length < 1) {
                throw createError.Conflict(`List carts is empty!`)
            }

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            };

            //Check list cart
            let promises = list_carts.map(async (item) => {
                let check = await CartModel.findOne({
                    customer_id,
                    _id: item.id
                })
                    .then(() => {
                        return true
                    })
                    .catch(() => {
                        return false
                    })
                return check
            })
            let check_id_cart = await Promise.all(promises);

            if (check_id_cart.includes(false)) {
                return res.status(400).json({
                    status: false,
                    message: "Check item of list carts!"
                })
            }
            //----------------------------------------------------------------
            let time_create = moment().add(process.env.TIME_ZONE);
            const addInfoForCart = async (order) => {
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
            //-----Case: Exist Order--------------------------------
            let exist_order = await ListOrderModel.findOne({
                'list_carts.id': { $in: list_carts.map(item => item.id) },
                payment_status: PaymentStatusEnum.UNPAID,
                delivery_status: DeliveryStatusEnum.UNDELIVERY,
                order_status: OrderStatusEnum.WAITING,
                customer_id,
                address,
                phone
            })
            if (exist_order) {
                exist_order.list_carts = list_carts;
                exist_order.cost = cost;
                exist_order.total_price = total_price;
                exist_order.code_promotion = code_promotion;
                exist_order.time_create = time_create;
                await exist_order.save();

                await addInfoForCart(exist_order);

                return res.status(200).json({
                    status: true,
                    data: exist_order
                })
            }

            //-----Case: Not Exist Order--------------------------------
            let newOrder = new ListOrderModel({
                customer_id, list_carts, cost, total_price, code_promotion, address, phone, time_create
            });
            await newOrder.save();

            await addInfoForCart(newOrder);

            return res.status(200).json({
                status: true,
                data: newOrder
            })
        } catch (err) {
            next(err)
        }
    },

    getOrderWaiting: async (req, res, next) => {
        try {
            let { id_customer, id_order } = req.body;

            if (!id_customer || !id_order) {
                return res.status(400).json(error_missing("id_customer && id_order"))
            };

            // Check customer
            let objCustomer = { _id: id_customer, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            };

            let order_waiting = await ListOrderModel.findOne({
                _id: new mongoose.Types.ObjectId(id_order),
                customer_id: customer._id,
                payment_status: "UNPAID",
                delivery_status: "UNDELIVERY",
                order_status: "WAITING",
            }).sort('-time_create');

            if (!order_waiting) {
                return res.status(200).json({
                    status: true,
                    data: []
                })
            }

            await Helper.addInfoForCart(order_waiting);

            return res.status(200).json({
                status: true,
                data: order_waiting
            })
        } catch (err) {
            next(err)
        }
    },

    orderPay: async (req, res, next) => {
        try {
            let { id_order, customer_id, is_paid, payment_type } = req.body;

            if (!id_order || !customer_id || !payment_type) {
                return res.status(400).json(error_missing("id_order && customer_id && payment_type"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            let order = await ListOrderModel.findOne({
                _id: id_order,
                customer_id
            });

            if (!order) {
                throw createError.Conflict(`Order is not exist!`)
            };
            order.payment_type = payment_type;
            order.payment_status = is_paid ? PaymentStatusEnum.PAID : PaymentStatusEnum.UNPAID;
            order.order_status = OrderStatusEnum.PROCESSING;
            await order.save();

            order.list_carts.forEach(async (item) => {
                let cart = await CartModel.findOne({
                    _id: new mongoose.Types.ObjectId(item.id),
                })
                if (cart) {
                    cart.status = "finished";
                    await cart.save();
                }
            })

            return res.status(200).json({
                status: true,
                data: order
            })
        } catch (err) {
            next(err);
        }
    },

    reOrder: async (req, res, next) => {
        try {
            let { id_customer, id_order } = req.body;

            if (!id_customer || !id_order) {
                return res.status(400).json(error_missing("id_customer && id_order"))
            };

            // Check customer
            let objCustomer = { _id: id_customer, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            };

            let oldOrder = await ListOrderModel.findOne({
                _id: new mongoose.Types.ObjectId(id_order),
                customer_id: customer._id,
            }).sort('-time_create');

            if (!oldOrder) {
                return res.status(200).json({
                    status: false,
                    message: "Old order is not exist!"
                })
            }

            let promise = oldOrder.list_carts.map(async (item) => {
                let cart = await CartModel.findOne({
                    _id: new mongoose.Types.ObjectId(item.id)
                });
                if (cart) {
                    let existCard = await CartModel.findOne({
                        customer_id: cart.customer_id,
                        product_id: cart.product_id,
                        status: CartStatusEnum.WAITED
                    });

                    if (existCard) {
                        existCard.quantity += item.quantity;
                        return await existCard.save();
                    } else {
                        let newCart = new CartModel({
                            customer_id: cart.customer_id,
                            product_id: cart.product_id,
                            quantity: cart.quantity,
                            status: CartStatusEnum.WAITED,
                            selected: true,
                        });
                        return await newCart.save();
                    }
                }
            })

            let result;
            await Promise.all(promise)
                .then(async () => {
                    const pipeline = [
                        {
                            $match: {
                                customer_id: id_customer,
                                status: CartStatusEnum.WAITED,
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
                    result = await CartModel.aggregate(pipeline);
                })

            return res.status(200).json({
                status: true,
                data: result
            })
        } catch (err) {
            next(err)
        }
    },
}