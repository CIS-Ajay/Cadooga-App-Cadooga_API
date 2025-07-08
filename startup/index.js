const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const i18n = require('i18n')

// custom req
const CONFIG = require('../config/v1/config');

module.exports = function (app) {
    console.log('loading startup files');
    // app.use(helmet({
    //     crossOriginResourcePolicy: false
    // }));

    // Define the static file path
    app.use('/uploads', express.static('uploads'));
    app.use('/public', express.static('public'));

    // Set header request for global use
    // app.use((req,res,next) => {
    //     (req.headers['accept-language']) ? 
    //         i18n.setLocale(req.headers['accept-language'])
    //     : 'en';
    //     next()
    // })

    // dev environment configurations
    if (CONFIG.env === 'dev' || CONFIG.env === 'development') {
        // app.use(morgan('tiny'));
        console.log('approved domains for development: ', CONFIG.cors_whitelist);
        console.log('development mode active....');
    }

    app.use(cors({ origin: CONFIG.cors_whitelist }))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
}