const createError = require('http-errors');

module.exports = {
    getPaypalClientId: async (req, res, next) => {
        try {
            return res.status(200).json({
                status: true,
                data: process.env.PAYPAL_CLIENT_ID
            })
        } catch (err) {
            next(err);
        }
    }
};
