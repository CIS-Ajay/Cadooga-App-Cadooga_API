'use strict';
const Sequelize = require('sequelize');
const sequelize = require('../config/v1/mysql');

const ApiTokenModel = require('../resources/v1/apiTokens/apiToken.model');
const RequestLogModel = require('../resources/v1/common/requestLog.model');
const UserModel = require('../resources/v1/users/user.model');
const UserProfileModel = require('../resources/v1/userProfile/user_profile.model');
const UserPhoneModel = require('../resources/v1/userPhone/user_phone.model');
const SettingModel = require('../resources/v1/settings/setting.model');
const UserAddressModel = require('../resources/v1/userAddress/user_address.model');
const UserPicModel = require('../resources/v1/userPic/user_pic.model');
const UserSocialModel = require('../resources/v1/userSocial/user_social.model');
const SubscriptionModel = require('../resources/v1/subscription/subscription.model');   
const NotificationModel = require('../resources/v1/notifications/notification.model');
const ProfileLinkModel = require('../resources/v1/profileLink/profile_link.model');
const SearchHisotryModel = require('../resources/v1/searchHistory/search_history.model');
const SocialStatusModel =  require('../resources/v1/socialStatus/social_status.model');
const ZodiacSignModel = require('../resources/v1/zodiacSign/zodiac_sign.model');


const models = {
    RequestLog: RequestLogModel.init(sequelize, Sequelize),
    ApiToken: ApiTokenModel.init(sequelize, Sequelize),
    User: UserModel.init(sequelize, Sequelize),
    UserProfile: UserProfileModel.init(sequelize, Sequelize),
    UserPhone: UserPhoneModel.init(sequelize, Sequelize),
    Setting: SettingModel.init(sequelize,Sequelize),
    UserAddress: UserAddressModel.init(sequelize,Sequelize),
    UserPic: UserPicModel.init(sequelize,Sequelize),
    UserSocial: UserSocialModel.init(sequelize,Sequelize),
    Subscription: SubscriptionModel.init(sequelize,Sequelize),
    Notification: NotificationModel.init(sequelize,Sequelize),
    ProfileLink: ProfileLinkModel.init(sequelize,Sequelize),
    SearchHistory: SearchHisotryModel.init(sequelize,Sequelize),
    SocialStatus: SocialStatusModel.init(sequelize,Sequelize),
    ZodiacSign: ZodiacSignModel.init(sequelize,Sequelize)

}   

Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

const db = {
    models,
    sequelize,
}

module.exports = db;