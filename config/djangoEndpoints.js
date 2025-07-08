const { UPDATE } = require("sequelize/lib/query-types");

module.exports = {
    AUTH: {
        VERIFY_OTP: {
            endpoint: '/user/signup/',
            method: 'patch',
        },
        REGISTER: {
            endpoint: '/user/signup/',
            method: 'post',
        },
        UPDATE_PROFILE: {
            endpoint: '/user/update/',
            method: 'patch',
        },
        DELETE_ACCOUNT: {
            endpoint: "/user/delete/",
            method: "delete"
        },
    },
};