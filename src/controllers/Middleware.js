const { verifyAccessToken } = require('../helpers/jwt_service')

const middlewareController = {
    verifyToken: (req, res, next) => {
        try {
            verifyAccessToken(req, res, next);
        } catch (err) {
            next(err);
        }
    },
};


module.exports = middlewareController;