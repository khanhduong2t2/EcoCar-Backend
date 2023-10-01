const nodemailer = require('nodemailer');
const createError = require('http-errors');
const AccountCustomer = require('../../models/customer/account_cus.model');

const { checkExistItem } = require('../../helpers/check_exist');
const { generateRandomString } = require('../../helpers/random');
const { verifyRefreshToken } = require('../../helpers/jwt_service');
const { signAccessToken, signRefreshToken } = require('../../helpers/jwt_service');
const { userValidateRegister, userValidateLogin } = require('../../helpers/validation');

const { error_missing } = require('../../configs/response');
const { EMAIL_REGISTERED_EN, EMAIL_REGISTERED_VI, USERNAME_REGISTERED_EN, USERNAME_REGISTERED_VI } = require('../../configs/message');

module.exports = {
    login: async (req, res, next) => {
        try {
            const { error } = userValidateLogin(req.body);
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

            if (!customerLogin.isVerify) {
                throw createError.NotFound('User not verify!')
            }

            const { token: accessToken, access_expires } = await signAccessToken(customerLogin._id);
            const { token: refreshToken, refresh_expires } = await signRefreshToken(customerLogin._id);
            res.json({
                status: true,
                data: {
                    accessToken: {
                        token: accessToken,
                        expires_in: access_expires
                    },
                    refreshToken: {
                        token: refreshToken,
                        expires_in: refresh_expires
                    },
                    info: {
                        id: customerLogin._id,
                        username: customerLogin.username
                    }
                }
            })
        } catch (err) {
            next(err);
        };
    },
    register: async (req, res, next) => {
        try {
            const { error } = userValidateRegister(req.body);
            const { lang } = req.headers;

            if (error) {
                throw createError(error.details[0].message)
            };

            const { email, username, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                throw createError.Conflict(`Confirmed password is not valid`)
            }

            const isExists = await AccountCustomer.findOne({
                $or: [
                    { email },
                    { username }
                ]
            });

            if (isExists) {
                if (isExists.email == email) {
                    // throw createError.Conflict(`${email} is ready been registered`)
                    return res.status(200).json({
                        status: false,
                        type: "email",
                        message: lang == "en" ? EMAIL_REGISTERED_EN : EMAIL_REGISTERED_VI
                    })
                } else {
                    // throw createError.Conflict(`${username} is ready been registered`)
                    return res.status(200).json({
                        status: false,
                        type: "username",
                        message: lang == "en" ? USERNAME_REGISTERED_EN : USERNAME_REGISTERED_VI
                    })
                }
            };

            const newCusAccount = new AccountCustomer({
                email,
                username,
                password
            });

            const savedUser = await newCusAccount.save();

            if (savedUser) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail', // Ví dụ: 'gmail'
                    auth: {
                        user: 'khanhduong2t2@gmail.com',
                        pass: process.env.PASSWORD_EMAIL,
                    },
                });

                const verificationLink = `https://eco-car-backend.vercel.app/v1/eco/customer/verify?user=${username}`

                const mailOptions = {
                    from: 'khanhduong2t2@email.com',
                    to: email,
                    subject: 'Xác thực tài khoản',
                    html: `
                        <p>Xin chào, bạn đã đăng ký tài khoản thành công.</p>
                        <p>Vui lòng <a href="${verificationLink}">nhấp vào đây</a> để xác minh tài khoản.</p>
                    `,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email contact đã được gửi: ' + info.response);
                    }
                });
            }

            return res.status(200).json({
                status: 'OK',
                data: savedUser
            });
        } catch (err) {
            next(err);
        };
    },

    verify: async (req, res, next) => {
        try {
            let { user } = req.query;

            await AccountCustomer.updateOne(
                { username: user },
                { $set: { isVerify: true } },
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: err.message
                        })
                    }
                }
            );

            res.redirect('https://e-commerce-car-azure.vercel.app/')
        } catch (err) {
            next(err);
        };
    },

    refreshToken: async (req, res, next) => {
        try {
            let { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json(error_missing("refreshToken"))
            };

            let payload = verifyRefreshToken(refreshToken, next);

            // Check customer
            let objCustomer = { _id: payload.userId, isVerify: true };
            const customer = await checkExistItem(AccountCustomer, objCustomer, "Customer");

            const newAccessToken = await signAccessToken(customer._id);

            return res.status(200).json({
                status: true,
                accessToken: {
                    token: newAccessToken.token,
                    expires_in: newAccessToken.access_expires
                }
            })
        } catch (err) {
            next(err);
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            let { email } = req.body;
            let { lang } = req.headers;
            if (!email) {
                return res.status(200).json({
                    status: false,
                    errCode: 4001,
                    message: lang == "en" ? "Please enter a valid email address!" :
                        "Vui lòng điền email !"
                })
            };

            // Check customer
            let customer = await AccountCustomer.findOne({ email: email, isVerify: true })
            if (!customer) {
                return res.status(200).json({
                    status: false,
                    errCode: 4002,
                    message: lang == "en" ? "Email is not registered or authenticated !" :
                        "Email chưa được đăng kí hoặc xác thực !"
                })
            };

            const transporter = nodemailer.createTransport({
                service: 'gmail', // Ví dụ: 'gmail'
                auth: {
                    user: 'khanhduong2t2@gmail.com',
                    pass: process.env.PASSWORD_EMAIL,
                },
            });

            const passSupport = generateRandomString(10);

            let message = lang == "en" ? `<p>Your new password is: <strong>${passSupport}</strong></p><p>Please change your password !</p>` :
                `<p>Mật khẩu mới của bạn là: <strong>${passSupport}</strong></p><p>Làm ơn thực hiện thay đổi lại mật khẩu !</p>`;

            const mailOptions = {
                from: 'khanhduong2t2@email.com',
                to: email,
                subject: lang == 'en' ? 'Change password E-Car' : 'Thay đổi mật khẩu E-Car',
                html: message,
            };

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email forgot password đã được gửi: ' + info.response);

                    customer.password = passSupport;
                    await customer.save();
                }
            });

            return res.status(200).json({
                status: true,
                data: customer
            })

        } catch (err) {
            next(err);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            let { customer_id, password, new_password, confirm_password } = req.body;

            if (!customer_id) {
                return res.status(400).json(error_missing("customer_id"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            let customer = await checkExistItem(AccountCustomer, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            }

            const isValid = await customer.isCheckPassword(password);
            if (!isValid) {
                throw createError.Conflict({
                    errCode: 3000,
                    errMessage: `Password is not valid`
                })
            };

            if (new_password !== confirm_password) {
                throw createError.Conflict({
                    errCode: 3001,
                    errMessage: `Confirmed password is not valid`
                })
            }

            customer.password = new_password;
            await customer.save();

            return res.status(200).json({
                status: true,
                data: customer
            })

        } catch (err) {
            next(err);
        }
    }
};
