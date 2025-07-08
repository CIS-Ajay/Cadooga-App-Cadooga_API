'use strict';
require('dotenv').config();

const jwt = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const ResponseHelper = require('../../helpers/v1/response.helpers');
const response = new ResponseHelper();

const ApiTokenResource = require('../../resources/v1/apiTokens/apiTokens.resources');
const _ApiToken = new ApiTokenResource();

const UsersResource = require('../../resources/v1/users/users.resources')
const _User = new UsersResource();

module.exports = class AuthorizationMiddleware {

    async auth(req, res, next) {
        console.log('AuthorizationMiddleware@auth');
        
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return response.unauthorized('missing api token', res, false);
        }
    
        const token = authHeader.replace(/^Bearer\s+/i, '');
        console.log("token------------------", token);
        const publicKey = fs.readFileSync(path.join(__dirname, '../../config2/jwt_key.pub'), 'utf8');

        try {
            jwt.verify(token, publicKey, { algorithms: ['RS256'] }, async (err, decoded) => {
                if (err) {
                    console.log('err:', err);
                    return response.unauthorized(err.message, res, false);
                }
    
                console.log("decoded==========", decoded.id);
                req.user = await _User.getOne(decoded.id);
    
                if (req.user === null || req.user === false) {
                    return response.unauthorized("invalid_token", res, false);
                }
    
                next();
            });
        } catch (error) {
            return response.unauthorized(error.message, res, false);
        }
    }
    

    async authAdmin(req,res,next){
        console.log('AuthorizationMiddleware@authAdmin');

        if (!req.headers['authorization']) {
            return response.unauthorized('missing api token', res, false);
        }

        let token = req.headers['authorization'];
        
        try{  
            jwt.verify(token, process.env.JWT_TOKEN_KEY, async(err, decoded) => {
                if (err) {
                  return response.unauthorized(err.message,res,false)
                }

                let user = await _User.getOne(decoded.user_id)
                let adminRoleId = await _Role.findBySlug('admin');

                let isAdminCheck = await _UserRole.findUserRoles(decoded.user_id);
                let roleArray = [];
                for(let admin of isAdminCheck){
                    roleArray.push(admin.role_id)
                }
            
                if(!_.includes(roleArray,adminRoleId.id)){
                    return response.unauthorized('you don\'t have permission.', res, false);
                }

                req.user = user

                next()
            });
        }
        catch (error) {
            return response.unauthorized(error.message, res, false);
        }
    }
}