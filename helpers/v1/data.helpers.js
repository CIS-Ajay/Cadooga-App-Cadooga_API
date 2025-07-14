const _ = require('lodash');
const hash = require('object-hash');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const moment = require('moment');
const Joi = require('joi');
const slugify = require('slugify');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
module.exports = class DataHelper {
    
    async joiValidation(reqBody, schema, language = 'en') {
        console.log('DataHelper@joiValidation');
        
        try {
            await Joi.object(schema).validateAsync(reqBody)  
            return false;
        }
        catch (err) { 
            let parsedErrors = [];
            const errors = err.details
            for (let e = 0; e < errors.length; e++) {
                let msg = errors[e].message
                msg = msg.replace(/["']/g, "")
                parsedErrors.push(msg.charAt(0).toUpperCase() + msg.slice(1))
            }


            if (parsedErrors.length > 0) {
                return parsedErrors;
            }
        } 

    }

    async generateUuid() {
        return uuidv4();
    }

    async generateHash(value) {
        console.log('DataHelper@generateHash');
        // generate a token
        let hashedValue = hash.sha1({
            value: value,
            random: new Date(),
        });

        return hashedValue;
    }

    async generateToken(data){
        console.log("DataHelper@generateToken");
        const crypto = require('crypto');
        const privateKey = fs.readFileSync(path.join(__dirname, '../../config2/jwt_key'), 'utf8');
        const gen_jti = crypto.randomBytes(16).toString('hex');
 
        data.jti = gen_jti; // JWT ID - required by Simple JWT
        data.token_type = 'access'; // Token type - required by Simple JWT
            
        // Standard JWT claims
        data.iat = Math.floor(Date.now() / 1000); // Issued at
        data.exp = Math.floor(Date.now() / 1000) + (60 * 60); // Expires in 1 hour
 
        const token = jwt.sign(data, privateKey, {
            algorithm: 'RS256',
        });
        console.log("token generated: ", data);
        if(!token){
            return false
        }
        return token
    }

    async hashPassword(password) {
        console.log('DataHelper@hashPassword');
        let hashedPassword = await bcrypt.hash(password, 10);

        if (!hashedPassword) {
            throw new Error('error generating password hash');
        }

        return hashedPassword;
    }

    async validatePassword(passwordString, passwordHash){
        console.log("DataHelper@validatePassword")
        let isPasswordValid = await bcrypt.compare(passwordString,passwordHash)

        if(!isPasswordValid){
            return false
        }

        return true
    }

    async replaceSpaces(value, replaceValue) {
        console.log('DataHelper@replaceSpaces');
        let newString = value.replace(/\s+/g, replaceValue);
        newString = newString.replace(/[';"!@#$%^&*]/g, '');

        console.log('returning string: ', newString);
        return newString;
    }

    async generateSlug(value, replaceValue) {
        console.log('DataHelper@generateSlug');
        let newString = slugify(value, {
            replacement: replaceValue,
            lower: true
        })
        
        console.log('returning string: ', newString);
        return newString;
    }

    async passwordRegex(password) {
        console.log('DataHelper@passwordRegex');
        let passwordRegex = RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*[@$!%*?&]).{8,}');

        console.log(passwordRegex.test(password));

        if (!passwordRegex.test(password)) {
            return false
        }
        return true;
    }

    async randomNumber(length) {
        console.log('DataHelper@randomNumber');
        let numString = '9';
        let addNumber = '1';
        for (let x = 0; x < length - 1; x++) {
            numString += 0
            addNumber += 0
        }

        let number = parseInt(numString);

        let randomNumber = Math.floor(Math.random() * Math.floor(number) + parseInt(addNumber));

        return randomNumber;
    }

    async validatePhone(phoneNumber) {
        console.log('DataHelper@validatePhone');
        let regex = RegExp('^[0-9]{10}$');

        if (!regex.test(phoneNumber)) {
            return false;
        }

        return true;
    }

    async calcTotalPages(totalAvail, limit) {
        console.log('DataHelper@calcTotalPages');
        let totalPages = Math.ceil(totalAvail / limit);
        if (totalPages < 1) {
            totalPages = 1;
        }

        return totalPages;
    }

    async getPageAndLimit(reqQuery) {
        console.log('DataHelper@getPageAndLimit');
        let resObj = {
            page: 1,
            limit: 50,
        };
        if (reqQuery.page) {
            if (typeof (parseInt(reqQuery.page)) !== 'number') {
                return {
                    error: true,
                    message: 'invalid page value',
                    status_code: 400,
                }
            }

            if (parseInt(reqQuery.page) < 1) {
                return {
                    error: true,
                    message: 'page must be a positive value',
                    status_code: 400,
                }
            }

            resObj.page = parseInt(reqQuery.page);
        }

        if (reqQuery.limit) {
            if (typeof (parseInt(reqQuery.limit)) !== 'number') {
                return {
                    error: true,
                    message: 'invalid limit value',
                    status_code: 400,
                }
            }

            if (parseInt(reqQuery.limit) < 1) {
                return {
                    error: true,
                    message: 'limit must be a positive value',
                    status_code: 400,
                }
            }

            if(parseInt(reqQuery.limit) > 100) {
                resObj.limit = 100
            } else {
                resObj.limit = parseInt(reqQuery.limit);
            }
        }

        return resObj;
    }

    async validateDateFormat(date) {
        console.log('DataHelper@validateDateFormat');
        // ^(20[0-9][0-9])[-](0[1-9]|1[0-2])[-](0[1-9]|[12][0-9]|3[01])$

        console.log(date);
        let dateRegex = RegExp('^(20[0-9][0-9])[-](0[1-9]|1[0-2])[-](0[1-9]|[12][0-9]|3[01])$');

        if (!dateRegex.test(date)) {
            return false
        }
        return true;
    }

    async datePlus(days) {
        let date = new Date(Date.now() + 1000 * 60 * 60 * 24 * days)
        return date;
    }

    async parseJoiErrors(errors) {
        console.log('DataHelper@parseJoiErrors');
        let parsedErrors = [];

        if (errors.error) {
            errors = errors.error.details

            for (let e = 0; e < errors.length; e++) {
                let msg = errors[e].message
                msg = msg.replace(/["']/g, "")
                parsedErrors.push(msg.replace(/_/g, ' '))
            }
        }

        return parsedErrors;
    }

    async getGoogleAddress(address = null, city = null, country = null) {
        console.log('DataHelper@getGoogleAddress');
        if (!address && !city && !country) {
            throw new Error('invalid address/city/country arguments');
        }

        let searchAddress = `${address}+${city}+${country}`;

        let googleAddress = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchAddress}&key=${process.env.GOOGLE_MAPS_KEY}`, {})


        let googleData = googleAddress.data;
        let fullAddress = {
            formatted_address: googleData.results[0].formatted_address,
            address_line_1: null,
            address_line_2: null,
            city: null,
            postal_code: null,
            country: null,
            location: {
                type: 'Point',
                coordinates: [googleData.results[0].geometry.location.lng, googleData.results[0].geometry.location.lat]
            },
        };
        let comp = googleData.results[0].address_components;
        for (let x = 0; x < comp.length; x++) {
            if (comp[x].types.includes('street_number')) {
                fullAddress.address_line_1 = (comp[x].long_name);
            }

            if (comp[x].types.includes('route')) {
                fullAddress.address_line_1 += ` ${comp[x].long_name}`;
            }

            if (comp[x].types.includes('locality')) {
                fullAddress.city = comp[x].long_name;
            }

            if (comp[x].types.includes('administrative_area_level_1') && comp[x].types.includes('political')) {
                fullAddress.province = comp[x].long_name;
            }

            if (comp[x].types.includes('country')) {
                fullAddress.country = comp[x].short_name;
            }

            if (comp[x].types.includes('postal_code')) {
                fullAddress.postal_code = comp[x].long_name;
            }
        }

        return fullAddress
    }

    async pagination(totalItems = null, pageNo = null, limit = null) {
        console.log('DataHelper@pagination');
        // set a default pageNo if it's not provided
        if (!pageNo) {
            pageNo = 1;
        }

        // set a default limit if it's not provided
        if (!limit) {
            if (totalItems > 50) {
                limit = 50
            } else {
                limit = totalItems;
            }
        } else {
            if (limit > totalItems) {
                limit = totalItems
            }
        }
        
        let totalPages = Math.ceil(totalItems / limit);
        if (totalPages < 1) {
            totalPages = 1;
        }
        
        // if the page number requested is greater than the total pages, set page number to total pages
        if (pageNo > totalPages) {
            pageNo = totalPages;
        }

        let offset;
        if (pageNo > 1) {
            offset = (pageNo - 1) * limit;
        } else {
            offset = 0;
        }
     
        return {
            pageNo,
            totalPages,
            offset,
            limit
        }
    }

    async generateOtp(){
        console.log('DataHelper@generateOtp');
        return Math.floor(10000 + Math.random() * 90000)
    }

    async checkPhoneNumber(number){
        console.log('DataHelper@checkPhoneNumber');
        const reg = /^(\+\d{1,3}[- ]?)?\d{10}$/;
        if (reg.test(number) === false) {
            return true;
        }
        return false
    }

    async getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {

        lon1 = lon1 * Math.PI / 180;
        lon2 = lon2 * Math.PI / 180;
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;

        // Haversine formula
        let dlon = lon2 - lon1;
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2)
            + Math.cos(lat1) * Math.cos(lat2)
            * Math.pow(Math.sin(dlon / 2), 2);

        let c = 2 * Math.asin(Math.sqrt(a));

        // Radius of earth in kilometers. Use 3956
        // for miles
        let r = 6371;

        // calculate the result
        return (c * r);

    }

    async calcHoursMinutes(time) {
        let hours = Math.round(time / 60);
        let minutes = time % 60;
        let hoursString='';
        if(hours>0){
            hoursString=`${hours} hours `;
        }
        let timeString = `${hoursString}${minutes} minutes`;
        return timeString;

    }

    async calculateDeliveryFee(toDistanceInKm) {
        // Here are calculate delivery fee on the basis of distance ,now we return static delivery fee
        let deliveryFee = '6.50'
        return deliveryFee
    }

    async currentUTCTime() {
        return moment().utc().format('YYYY-MM-DD HH:mm:ss');
    }
    
}