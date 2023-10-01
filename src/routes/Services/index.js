const CartRouter = require('./Cart');
const OrderRouter = require('./Order');
const ContactRouter = require('./Contact');

const RouterServices = [
    CartRouter,
    OrderRouter,
    ContactRouter
];

module.exports = RouterServices;
