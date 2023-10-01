'use strict'
const bcrypt = require('bcrypt');
const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'AccountCustomer'
const COLLECTION_NAME = 'AccountCustomers'

const accCustomersSchema = new Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        trim: true,
    },
    phone: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    isVerify: {
        type: Boolean,
        required: true,
        default: false,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

accCustomersSchema.pre('save', async function (next) {
    try {
        // Kiểm tra password có đc thay đổi
        if (!this.isModified('password')) {
            return next();
        }

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
