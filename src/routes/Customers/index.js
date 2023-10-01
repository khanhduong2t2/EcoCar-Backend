const AuthenticationRouter = require('./Authentication');
const InfoRouter = require('./Info');

const RouterCustomers = [
    AuthenticationRouter,
    InfoRouter
];

module.exports = RouterCustomers;
