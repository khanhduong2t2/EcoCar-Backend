'use strict'

const express = require('express');
const router = express.Router();

const { baseURL } = require('../configs/config.url');

router.use(`${baseURL}/customer`, require('./Customers/index'));
router.use(`${baseURL}/product`, require('./Products/index'));

module.exports = router;