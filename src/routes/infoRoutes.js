const express = require('express');
const InfoController = require('../controllers/infoController');

module.exports = () => {
    const router = express.Router();
    const controller = new InfoController();
    ['/how-it-works', '/about', '/privacy', '/terms', '/contact', '/security', '/help'].forEach((route) => router.get(route, controller.show));
    router.get('/report', controller.report);
    return router;
};
