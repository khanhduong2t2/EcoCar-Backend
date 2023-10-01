const ContactRouter = require('express').Router();

const ContactController = require('../../controllers/service/Contact.controller');
const Middleware = require('../../controllers/Middleware')

ContactRouter.post('/create-contact', Middleware.verifyToken, ContactController.createContact);

module.exports = ContactRouter;