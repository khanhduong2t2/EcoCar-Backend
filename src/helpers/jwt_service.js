const JWT = require('jsonwebtoken');
const createError = require('http-errors');

const signAccessToken = async (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId
        };
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const options = {
            expiresIn: '30m'
        };

        JWT.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token);
        });
    });
};

const signRefreshToken = async (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId
        };
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const options = {
            expiresIn: '30d'
        };
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token);
        });
    });
};

module.exports = {
    signAccessToken,
    signRefreshToken,
}