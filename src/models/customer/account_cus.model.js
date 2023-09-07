'use strict'
const bcrypt = require('bcrypt');
const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'AccountCustomer'
const COLLECTION_NAME = 'AccountCustomers'

const accCustomersSchema = new Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

accCustomersSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(this.password, salt);
        this.password = hashPassword;
        next();
    } catch (error) {
        next(error);
    }
})

accCustomersSchema.methods.isCheckPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        next(error);
    }
}

//Export the model
module.exports = model(DOCUMENT_NAME, accCustomersSchema);
