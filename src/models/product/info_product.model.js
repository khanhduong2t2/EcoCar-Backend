'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'infoProduct'
const COLLECTION_NAME = 'infoProducts'

const infoProductsSchema = new mongoose.Schema({
    product_id: {
        type: String,
        required: true,
    },
    content: {
        type: Array,
        required: false
    },
    content_en: {
        type: Array,
        required: false
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, infoProductsSchema);
