const express = require('express');
const app = express();
const i18n = require('i18n')
let server;
const i18nConfig = require('./i18n') 

/**
 * configure shared state
 */
i18n.configure(i18nConfig)

require('./startup')(app);
require('./startup/models')

const port = process.env.APPLICATION_PORT || 3055;
const HOST = '127.0.0.0' || "localhost";
// const HOST = '192.168.2.216' || "localhost";
console.log('port: ', port);

if(process.env.SSL_STATUS === 'true'){
    const fs = require('fs');
    let key = fs.readFileSync(process.env.SSL_KEY_PEM_PATH, 'utf8').toString();
    let cert = fs.readFileSync(process.env.SSL_CERT_PEM_PATH, 'utf8').toString();
    
    const options = {
        key: key,
        cert: cert
    };
    server = require('https').createServer(options,app);
}else{
    server = require('http').Server(app);
}

console.log("server running");

server.listen(port, HOST, async (req,res) => {
    const error = require('./middleware/v1/error');

    // services
    // await require('./services/v1/cache');

    // routes
    await require('./startup/routes')(app);

    app.use(error);
    console.log('listening on port: ', port);
});