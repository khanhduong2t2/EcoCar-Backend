const createError = require('http-errors');

const checkExistItem = async (model, object, name) => {
    try {
        const existItem = await model.findOne(object);

        if (!existItem) {
            throw createError.NotFound(`${name} is not found!`);
        }
        return existItem
    } catch (err) {
        throw createError(`${err.message}`);
    }
}

module.exports = {
    checkExistItem
}