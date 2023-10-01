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

            const now = new Date();
            now.setTime(now.getTime() + 30 * 60 * 1000);
            let access_expires = now.getTime();
            resolve({ token, access_expires });
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
            expiresIn: '1d'
        };
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)

            const now = new Date();
            now.setTime(now.getTime() + 24 * 60 * 60 * 1000);
            let refresh_expires = now.getTime();
            resolve({ token, refresh_expires });
        });
    });
};

const verifyAccessToken = (req, res, next) => {
    if (!req.headers['authorization']) {
        throw createError.Unauthorized()
    }

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    // start verify token
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return next(createError.Unauthorized())
            } else if (err.name === 'TokenExpiredError') {
                return next(createError.Unauthorized("Token is expired"))
            }
            return next(createError.Unauthorized(err.message))
        }
        req.payload = payload;
        next();
    })
};

const verifyRefreshToken = (refreshToken, next) => {
    const token = refreshToken;

    let data;
    JWT.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return next(createError.Unauthorized())
            } else if (err.name === 'TokenExpiredError') {
                return next(createError.Unauthorized("Token is expired"))
            }
            return next(createError.Unauthorized(err.message))
        }
        data = payload;
    })

    return data
};

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}