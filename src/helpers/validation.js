const Joi = require('joi');

const userValidateRegister = data => {
    const userSchema = Joi.object({
        email: Joi.string().pattern(new RegExp('gmail.com')).email().lowercase().required(),
        username: Joi.string().min(4).max(32).lowercase().required(),
        password: Joi.string().min(4).max(32).required(),
        confirmPassword: Joi.string().min(4).max(32).required(),
    })

    return userSchema.validate(data);
}

const userValidateLogin = data => {
    const userSchema = Joi.object({
        username: Joi.string().min(4).max(32).lowercase().required(),
        password: Joi.string().min(4).max(32).required(),
    })

    return userSchema.validate(data);
}

module.exports = {
    userValidateRegister,
    userValidateLogin
}
