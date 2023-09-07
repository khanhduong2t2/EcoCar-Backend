'use strict'
const bcrypt = require('bcrypt');
const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'ListProduct'
const COLLECTION_NAME = 'ListProducts'

const listProductsSchema = new Schema({
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
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, listProductsSchema);
