'use strict'

const mongoose = require('mongoose');

const DOCUMENT_NAME = 'ListNew'
const COLLECTION_NAME = 'ListNews'

const listNewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    list_contents: {
        type: Array,
        required: true,
    },
    list_images: {
        type: Array,
        required: false,
    },
    list_videos: {
        type: Array,
        required: false,
    },
    status: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = mongoose.model(DOCUMENT_NAME, listNewsSchema);
