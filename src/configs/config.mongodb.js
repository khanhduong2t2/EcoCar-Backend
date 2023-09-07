'use strict'

const dev = {
    db: {
        host: process.env.DEV_DB_HOST,
        password: process.env.DEV_DB_PASSWORD,
        name: process.env.DEV_DB_NAME,
    }
}

const pro = {
    db: {
        host: process.env.PRO_DB_HOST,
        password: process.env.PRO_DB_PASSWORD,
        name: process.env.PRO_DB_NAME,
    }
}

const config = { dev, pro };
const env = process.env.NODE_ENV || 'dev';
module.exports = config[env]