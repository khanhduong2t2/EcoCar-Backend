'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'ListCertified'
const COLLECTION_NAME = 'ListCertifieds'

const listCertifiedsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, listCertifiedsSchema);
