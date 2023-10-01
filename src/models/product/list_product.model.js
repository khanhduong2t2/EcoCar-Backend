'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'ListProduct'
const COLLECTION_NAME = 'ListProducts'

const listProductsSchema = new mongoose.Schema({
    product_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    link_image: {
        type: Array,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    status: {
        type: String,
    },
    key_search: {
        type: Array,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, listProductsSchema);
