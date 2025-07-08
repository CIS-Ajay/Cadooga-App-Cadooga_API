// File: resources/v1/social_media/social_media.routes.js
const express = require('express');
const router = express.Router();

const Authorize = require('../../../middleware/v1/authorize');
const auth = new Authorize();

const SocialMediaProxyController = require('./social_media.proxy.controller');
const controller = new SocialMediaProxyController();

router.post('/tapped/', auth.auth, controller.tapped);
router.post('/social-media-details/create', auth.auth, controller.createSocialMediaDetails);
router.put('/social-media-details/:pk', auth.auth, controller.updateSocialMediaDetails);
router.delete('/social-media-details/:pk', auth.auth, controller.deleteSocialMediaDetails);
router.get('/message', auth.auth, controller.getAllMessages);
router.post('/message', auth.auth, controller.createMessage);
router.get('/message/:pk', auth.auth, controller.getMessageById);
router.put('/message/:pk', auth.auth, controller.updateMessageById);
router.delete('/message/:pk', auth.auth, controller.deleteMessageById);
router.post('/user-social-media-link', auth.auth, controller.userSocialMediaLink);
router.post('/create-click-track', auth.auth, controller.createClickTrack);

module.exports = router;
