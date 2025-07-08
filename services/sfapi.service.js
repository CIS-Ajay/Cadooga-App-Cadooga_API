const axios = require('axios')

module.exports = class SfapiService {

    constructor(){
        this.headers  = {
            'Content-Type' : 'application/json'
        }

        this.sfapiInstance = axios.create({
            baseURL: process.env.SFAPI_URL + '/api/v1/',
            timeout: 30000,
            headers: this.headers
        });

    }

    async createUserRelation(data, token){
        console.log("sfapiService@createUserRelation");
        try{
            return await this.sfapiInstance.post('user_relations',
            data,
            {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization': token
                }
            })
        }
        catch(err){
            return { status : err.response.status, data: err.response.data};
        }
    }

    async createUserCareRole(data, token){
        console.log("sfapiService@createUserCareRole");
        try{
            return await this.sfapiInstance.post('care_teams',
            data,
            {
                headers : {
                    'Content-Type' : 'application/json',
                    'Authorization': token
                }
            })
        }
        catch(err){
            console.log(err)
            return { status : err.response.status, data: err.response.data};
        }
    }

    async getLovedOneDetails(uuid){
        console.log("sfapiService@getLovedOneDetails");
        try{
            let result = await this.sfapiInstance.get('care_teams/getOneLoveOneUuid/' + uuid);
            return result;
        }
        catch(err){
            return false;
        }
    }
    
}