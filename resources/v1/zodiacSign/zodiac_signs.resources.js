'use strict';
const Op = require('sequelize').Op;
const DataHelper = require('../../../helpers/v1/data.helpers');
const _DataHelper = new DataHelper();

const Zodiac = require('./zodiac_sign.model');


module.exports = class ZodiacResource {
    
    async createOne(data = null) {
        console.log('ZodiacResource@createOne');
        if (!data || data === '') {
            throw new Error('data is required');
        }
        
        let subscription = await Zodiac.create(data);

        if (!subscription) {
            return false;
        }
        return subscription;
    }

    
    async getOne(id){
        console.log("ZodiacResource@getOne")
        if (!id || id === '') {
            throw new Error('id is required');
        }

        let subscription = await Zodiac.findOne({
            where: {
                id: id
            },
            raw: true,
            //logging: console.log
        })

        if(!subscription){
            return false;
        }


        return subscription;
    }


    async updateOne(id, data) {
        console.log('ZodiacResource@updateOne');

        if (!id || id === '') {
            throw new Error('id is required');
        }

        try {
            await Zodiac.update(data, {
                where: {
                    id: id
                }
            });
        } catch (err) {
            throw err
        }

        return true;
    }


    async updateOrCreate(condition, data) {
        console.log('ZodiacResource@updateOrCreate');
       try {
        let results;
        let existingLocation = await Zodiac.findOne({ where: condition });
        
        if (existingLocation) {
            results = await Zodiac.update(data, { where: condition });
            results = await Zodiac.findOne({ where: condition });
        } else {
            results = await Zodiac.create(data);
        }

        return results;
       }
       catch (err) {
        throw err
       }
       
    }


    async deleteOne(id) {
        console.log('ZodiacResource@deleteOne');
        try {
            await Zodiac.destroy({
                where: {
                    id: id,
                }
            });
        } catch (err) {
            Error.payload = err.errors ? err.errors : err.message;
            throw new Error();
        }
    
        return true;
    }


    async deleteByUserId(userId, options = {}) {
        console.log("ZodiacResource@deleteByUserId");
        try {
          await Zodiac.destroy({
            where: { user_id: userId },
            ...options,
          });
        } catch (err) {
          Error.payload = err.errors ? err.errors : err.message;
          throw new Error();
        }
    
        return true;
    }


    //Old right function
    // async getZodiacSignId(month, day) {
    //     console.log("ZodiacResource@getZodiacSignId", { month, day });
    //     if (!month || !day) {
    //       console.error("Invalid month or day passed:", { month, day });
    //       return null;
    //     }
      
    //     const formatted = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
    //     const zodiacSigns = await Zodiac.findAll();
    //     console.log("zodiacSigns", zodiacSigns);
      
    //     for (const sign of zodiacSigns) {
    //       const start = sign.start_date;
    //       const end = sign.end_date;
      
    //       if (
    //         (formatted >= start && formatted <= end) ||
    //         (start > end && (formatted >= start || formatted <= end)) // for Capricorn (cross-year)
    //       ) {
    //         return sign.id;
    //       }
    //     }
      
    //     return null;
    //   }
      
    async getZodiacSignId(month, day) {
        console.log("ZodiacResource@getZodiacSignId", { month, day });
      
        if (!month || !day) {
          console.error("Invalid month or day passed:", { month, day });
          return null;
        }
      
        // Month map
        const monthMap = {
          Jan: 1, Feb: 2, Mar: 3, Apr: 4,
          May: 5, Jun: 6, Jul: 7, Aug: 8,
          Sep: 9, Oct: 10, Nov: 11, Dec: 12,
        };
      
        let monthNumber = typeof month === "string" ? monthMap[month] : month;
      
        if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
          console.error("Invalid month provided:", month);
          return null;
        }
      
        const formatted = `${monthNumber.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
        const zodiacSigns = await Zodiac.findAll();
      
        for (const sign of zodiacSigns) {
          const start = sign.start_date;
          const end = sign.end_date;
      
          if (
            (formatted >= start && formatted <= end) ||
            (start > end && (formatted >= start || formatted <= end)) // for Capricorn (cross-year)
          ) {
            return sign.id;
          }
        }
      
        return null;
      }

      
      


}