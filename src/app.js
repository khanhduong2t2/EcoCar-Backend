const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');

const cors = require('cors');
const morgan = require('morgan');
const createError = require('http-errors');
const compression = require('compression');
const { default: helmet } = require('helmet');

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json({}));
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// init routes
app.use('/', require('./routes'))

app.use((req, res, next) => {
    next(createError.NotFound('This route does not exist!'))
})
app.use((err, req, res, next) => {
    res.json({
        status: err.status || 500,
        message: err.message
    })
})

// init db
require('./dbs/init.mongodb');

// handing error

module.exports = app;