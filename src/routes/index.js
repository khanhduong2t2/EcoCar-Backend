'use strict'

const express = require('express');
const router = express.Router();

const { baseURL } = require('../configs/config.url');

router.use(`${baseURL}/customer`, require('./Customers/index'));
router.use(`${baseURL}/product`, require('./Products/index'));
router.use(`${baseURL}/service`, require('./Services/index'));
router.use(`${baseURL}/config`, require('./Configs/index'));
router.use(`${baseURL}/content`, require('./Contents/index'));
router.use(`${baseURL}/feedback`, require('./Feedbacks/index'));
router.use(`${baseURL}/promotion`, require('./Promotions/index'));
router.use(`${baseURL}/purchase`, require('./Purchases/index'));

module.exports = router;