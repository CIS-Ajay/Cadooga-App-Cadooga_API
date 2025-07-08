const _ = require('lodash');

const ResponseHelper = require('../../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const ApiTokensResource = require('./apiTokens.resources');
const _ApiToken = new ApiTokensResource();

module.exports = class ApiTokensController {
    async getAll(req, res) {
        console.log('ApiTokensController@getAll');
        let apiTokens = await _ApiToken.getAll();

        if(!apiTokens) {
            return response.notFound('No api tokens found.', res, false);
        }

        return response.success('Api tokens found.', res, apiTokens);
    }
}