require('dotenv').config();

const i18n = require('i18n')

module.exports = class ResponseHelper {

    async success(message, res, data) {
        this.sendResponse(200, i18n.__(message), res, data);
    };

    async created(message, res, data) {
        this.sendResponse(200, i18n.__(message), res, data);
    };

    async createdResp(message, res, data, index ) {
        this.sendResponse(200, i18n.__(message), res, data, index);
    };

    async notFoundResp(message, res, data, index) {
        this.sendResponse(404, i18n.__(message), res, data, index);
    };

    async conflictResp(message, res, data, index = null) {
        this.sendResponse(409, i18n.__(message), res, data, index);
    };

    async noContent(message, res, data) {
        this.sendResponse(204, i18n.__(message), res, data);
    };

    async redirect(url, res) {
        return res.status(200).send({
            api_ver: process.env.API_VER,
            redirect_to: url,
        });
    };

    async badRequest(message, res, data) {
        this.sendResponse(400, i18n.__(message), res, data);
    };

    async unauthorized(message, res, data) {
        this.sendResponse(401, i18n.__(message), res, data);
    };

    async forbidden(message, res, data) {
        this.sendResponse(403, i18n.__(message), res, data);
    };

    async notFound(message, res, data) {
        this.sendResponse(404, i18n.__(message), res, data);
    };

    async exception(message, res, data) {
        this.sendResponse(500, i18n.__(message), res, data);
    };

    async conflict(message, res, data) {
        this.sendResponse(409, i18n.__(message), res, data);
    };

    async custom(code, message, res, data) {
        this.sendResponse(code, i18n.__(message), res, data);
    }

    async twoFactorEnabled(res) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(200).send({
            api_ver: process.env.API_VER,
            message: 'TwoFactor authentication has been enabled for your account. We have sent you an access code to the phone associated to your account. Please verify the code to proceed',
            two_factor: true
        });
    };

    // async sendResponse(code, message, res, data, index) {
    //     res.setHeader('Access-Control-Allow-Origin', '*');
    //     res.setHeader('Access-Control-Allow-Credentials', 'true');
    //     res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
    //     if (!data) {
    //         return res.status(code).send({
    //             status_code: code,//code == 200 ? true : false,
    //             api_ver: process.env.API_VER,
    //             message: message,
    //         });
    //     } else {
    //         return res.status(code).send({
    //             status_code: code, // code == 200 ? true : false,
    //             api_ver: process.env.API_VER,
    //             message: message,
    //             data: data,
    //         });
    //     }
    // }

    async sendResponse(code, message, res, data, index) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
        const response = {
            status_code: code,
            api_ver: process.env.API_VER,
            message: message,
        };
        
        if (data) {
            response.data = data;
        }

        if (index) {
            response.index = index;
        }
        return res.status(code).send(response);
    }
    
}