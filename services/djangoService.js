// File: services/djangoService.js
const axios = require('axios');
require('dotenv').config();

const djangoAPI = axios.create({
    baseURL: process.env.PYTHON_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

const forwardToDjangoRaw = async ({ endpoint, method, data = {}, headers = {}, params = {} }) => {
    return await djangoAPI.request({ url: endpoint, method, data, headers, params });
};

const forwardToDjango = async ({ endpoint, method, data = {}, headers = {} }) => {
    try {
        console.log('Sending to Django:', { endpoint, method, data });

        const response = await djangoAPI.request({
            url: endpoint,
            method,
            data,
            headers,
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        console.error("Forwarding to Django failed:", {
            url: endpoint,
            status: error.response?.status,
            response: error.response?.data,
        });
        throw {
            status: error.response?.status || 500,
            ...error.response?.data
        };
    }
};

module.exports = { forwardToDjango, forwardToDjangoRaw };