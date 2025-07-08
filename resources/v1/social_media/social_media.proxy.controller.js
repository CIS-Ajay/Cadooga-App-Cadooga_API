// File: resources/v1/social_media/social_media.proxy.controller.js
const { proxyRequest } = require('../../../utils/proxy.helper');

const SOCIAL_BASE = '/social_media';

class SocialMediaProxyController {
    constructor() {
        this.routes = [
            { key: 'tapped', method: 'post', path: '/tapped/' },
            { key: 'createSocialMediaDetails', method: 'post', path: '/social-media-details/create' },
            { key: 'updateSocialMediaDetails', method: 'put', path: '/social-media-details/:pk' },
            { key: 'deleteSocialMediaDetails', method: 'delete', path: '/social-media-details/:pk' },
            { key: 'getAllMessages', method: 'get', path: '/message/' },
            { key: 'createMessage', method: 'post', path: '/message/' },
            { key: 'getMessageById', method: 'get', path: '/message/:pk' },
            { key: 'updateMessageById', method: 'put', path: '/message/:pk' },
            { key: 'deleteMessageById', method: 'delete', path: '/message/:pk' },
            { key: 'userSocialMediaLink', method: 'post', path: '/user-social-media-link/' },
            { key: 'createClickTrack', method: 'post', path: '/create-click-track/' },
        ];

        this.routes.forEach(route => {
            this[route.key] = async (req, res) => {
                const resolvedPath = SOCIAL_BASE + route.path.replace(':pk', req.params.pk || '');
                return proxyRequest(req, res, resolvedPath, route.method);
            };
        });
    }
};    

module.exports = SocialMediaProxyController;
