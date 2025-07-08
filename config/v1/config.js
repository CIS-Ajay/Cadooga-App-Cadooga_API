require('dotenv').config();

// create a global CONFIG object that can be throughout the application
let CONFIG = {};

CONFIG.env = process.env.ENV || 'dev';
CONFIG.port = process.env.PORT || '3000';

CONFIG.pg_driver = process.env.DB_DRIVER || 'postgres';
CONFIG.pg_host = process.env.POSTGRES_HOST || 'localhost';
CONFIG.pg_port = process.env.POSTGRES_PORT || '5432';
CONFIG.pg_name = process.env.POSTGRES_DB_NAME || 'default'
CONFIG.pg_user = process.env.POSTGRES_USER || 'root';
CONFIG.pg_password = process.env.POSTGRES_PASSWORD || 'root';



CONFIG.api_ver = process.env.API_VER;

if (process.env.ENV === 'prod' || process.env.ENV === 'production') {
    CONFIG.cors_whitelist = ['http://localhost:3000'];
} else if (process.env.ENV === 'stag' || process.env.ENV === 'staging') {
    CONFIG.cors_whitelist = [ 'http://localhost:3000']
} else {
    CONFIG.cors_whitelist = [
        'http://localhost:6000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8010',
        'http://127.0.0.1:8010'  
    ]

    CONFIG.pn_publishKey = process.env.PUBNUB_PUBLISH;
    CONFIG.pn_subscribeKey = process.env.PUBNUB_SUBSCRIBE;
}

module.exports = CONFIG;
