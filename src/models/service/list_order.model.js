'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'ListOrder'
const COLLECTION_NAME = 'ListOrders'

const listOrdersSchema = new mongoose.Schema({
    customer_id: {
        type: String,
        required: true,
        ref: "AccountCustomer"
    },
    list_carts: {
        type: Array,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    total_price: {
        type: Number,
        required: true,
    },
    code_promotion: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    payment_type: {
        type: String,
        required: false,
        default: null
    },
    payment_status: {
        type: String,
        required: true,
        default: "UNPAID"
    },
    delivery_status: {
        type: String,
        required: true,
        default: "UNDELIVERY"
    },
    order_status: {
        type: String,
        required: true,
        default: "WAITING"
    },
    feedback: {
        type: Object,
        required: false,
    },
    time_create: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, listOrdersSchema);
