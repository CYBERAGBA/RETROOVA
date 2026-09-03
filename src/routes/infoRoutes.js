const express = require('express');
const InfoController = require('../controllers/infoController');
const csrfMiddleware = require('../middleware/csrfMiddleware');

module.exports = (adminModel) => {
    const router = express.Router();
    const controller = new InfoController(adminModel);
    ['/how-it-works', '/about', '/privacy', '/terms', '/contact', '/security', '/help'].forEach((route) => router.get(route, controller.show));
    ['/partnerships', '/partenariats'].forEach((route) => { router.get(route, controller.show); router.post(route, csrfMiddleware, controller.submitPartnership); });
    router.get('/report', controller.show);
    return router;
};
