const createError = require('http-errors');

const AccountCustomer = require('../../models/customer/account_cus.model');

const { userValidate } = require('../../helpers/validation');
const { signAccessToken, signRefreshToken } = require('../../helpers/jwt_service');

module.exports = {
    register: async (req, res, next) => {
        try {
            const { error } = userValidate(req.body);
            if (error) {
                throw createError(error.details[0].message)
            };

            const { username, password } = req.body;

            const isExists = await AccountCustomer.findOne({
                username
            });

            if (isExists) {
                throw createError.Conflict(`${username} is ready been registered`)
            };

            const newCusAccount = new AccountCustomer({
                username,
                password
            });

            const savedUser = await newCusAccount.save();

            return res.status(200).json({
                status: 'OK',
                elements: savedUser
            });
        } catch (err) {
            next(err);
        };
    },

    login: async (req, res, next) => {
        try {
            const { error } = userValidate(req.body);
            if (error) {
                throw createError(error.details[0].message)
            }

            let { username, password } = req.body;

            const customerLogin = await AccountCustomer.findOne({ username });
            if (!customerLogin) {
                throw createError.NotFound('User not registered!')
            };

            const isValid = await customerLogin.isCheckPassword(password);
            if (!isValid) {
                throw createError.Unauthorized();
            };

            const accessToken = await signAccessToken(customerLogin._id);
            const refreshToken = await signRefreshToken(customerLogin._id);

            res.json({
                status: true,
                accessToken,
                refreshToken
            })
        } catch (err) {
            next(err);
        };
    },

    testData: async (req, res, next) => {
        try {
            return res.status(200).json({
                status: true,
                data: "Duong"
            })
        } catch (err) {
            next(err);
        }
    }
};
