const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const createError = require('http-errors');
const mongoose = require('mongoose');
const AccCusModel = require('../../models/customer/account_cus.model');
const ListContactModel = require('../../models/service/list_contact.model');

const {
    error_missing
} = require('../../configs/response');

const {
    checkExistItem
} = require('../../helpers/check_exist')

module.exports = {
    createContact: async (req, res, next) => {
        try {
            let { customer_id, name_register, phone_register, type_car, content } = req.body;
            let { lang } = req.headers;

            if (!customer_id || !name_register || !phone_register) {
                return res.status(400).json(error_missing("customer_id && name_register && phone_register"))
            };

            // Check customer
            let objCustomer = { _id: customer_id, isVerify: true };
            const customer = await checkExistItem(AccCusModel, objCustomer, "Customer");

            if (customer._id.toString() !== req.payload.userId) {
                throw createError.Conflict(`User have not permission!`)
            };

            let newContact = new ListContactModel({
                customer_id, name_register, phone_register, type_car, content
            });
            await newContact.save()
                .then(data => {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'khanhduong2t2@gmail.com',
                            pass: process.env.PASSWORD_EMAIL,
                        },
                    });

                    let content = lang === "en" ? fs.readFileSync(path.join(__dirname, '../../data', `EmailContact_en.html`), 'utf8')
                        : fs.readFileSync(path.join(__dirname, '../../data', `EmailContact.html`), 'utf8');
                    content = content.split('${name_register}').join(data.name_register);
                    content = content.split('${phone_register}').join(data.phone_register);
                    content = content.split('${type_car}').join(data.type_car ? data.type_car : (lang === "en" ? "Not" : "Không"));
                    content = content.split('${content}').join(data.content ? data.content : (lang === "en" ? "Not" : "Không"));
                    const mailOptions = {
                        from: 'khanhduong2t2@email.com',
                        to: customer.email,
                        subject: 'E-Car cảm ơn bạn đã liên hệ',
                        html: content
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email xác thực đã được gửi: ' + info.response);
                        }
                    });
                })

            return res.status(200).json({
                status: true,
                data: newContact
            })
        } catch (err) {
            next(err);
        }
    }
}