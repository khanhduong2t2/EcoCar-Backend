'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'feedBackPublic'
const COLLECTION_NAME = 'feedBackPublics'

const feedBackPublicsSchema = new mongoose.Schema({
    customer_id: mongoose.Schema.Types.ObjectId,
    product_id: {
        type: String,
        required: true,
    },
    number_star: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, feedBackPublicsSchema);
