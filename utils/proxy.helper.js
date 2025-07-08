// File: utils/proxy.helper.js

const { forwardToDjangoRaw } = require('../services/djangoService');

async function proxyRequest(req, res, djangoEndpoint, method) {
    try {
        const djangoRes = await forwardToDjangoRaw({
            endpoint: djangoEndpoint,
            method,
            data: ['get', 'delete'].includes(method.toLowerCase()) ? {} : req.body,
            headers: {
                Authorization: req.headers['authorization'],
            },
            params: req.query,
        });

        res.status(djangoRes.status);
        if (djangoRes.headers && typeof djangoRes.headers === 'object') {
            for (const [key, value] of Object.entries(djangoRes.headers)) {
                res.setHeader(key, value);
            }
        }

        return res.send(djangoRes.data);
    } catch (err) {
        const status = err.response?.status || 500;
        const errorHeaders = err.response?.headers || {};
        const errorData = err.response?.data || { error: 'Internal Server Error' };

        res.status(status);
        if (errorHeaders && typeof errorHeaders === 'object') {
            for (const [key, value] of Object.entries(errorHeaders)) {
                res.setHeader(key, value);
            }
        }

        return res.send(errorData);
    }
}

module.exports = { proxyRequest };
