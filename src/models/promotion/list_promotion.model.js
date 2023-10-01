'use strict'

const mongoose = require('mongoose');
const PromotionStatusEnum = require('../enums/promotion_status.model');

const DOCUMENT_NAME = 'listPromotion'
const COLLECTION_NAME = 'listPromotions'

const listPromotionsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    type_value: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: PromotionStatusEnum.EXCEPT
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, listPromotionsSchema);
