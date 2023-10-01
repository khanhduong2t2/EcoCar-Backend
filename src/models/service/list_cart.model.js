'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'ListCart'
const COLLECTION_NAME = 'ListCarts'

const listCartsSchema = new mongoose.Schema({
    customer_id: {
        type: String,
        required: true,
    },
    product_id: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "waited"
    },
    selected: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, listCartsSchema);
