'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'ListContact'
const COLLECTION_NAME = 'ListContacts'

const listContactsSchema = new mongoose.Schema({
    customer_id: {
        type: String,
        required: true,
    },
    name_register: {
        type: String,
        required: true,
    },
    phone_register: {
        type: String,
        required: true,
    },
    type_car: {
        type: String,
    },
    content: {
        type: String,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, listContactsSchema);
