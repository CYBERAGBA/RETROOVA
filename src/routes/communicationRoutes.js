const express = require('express');
const CommunicationController = require('../controllers/communicationController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const csrfMiddleware = require('../middleware/csrfMiddleware');

module.exports = (model, itemModel, userModel) => {
    const router = express.Router();
    const controller = new CommunicationController(model, itemModel, userModel);
    router.get('/messages', isAuthenticated, controller.index);
    router.post('/messages', isAuthenticated, csrfMiddleware, controller.send);
    router.post('/messages/:id/read', isAuthenticated, csrfMiddleware, controller.read);
    router.post('/messages/block', isAuthenticated, csrfMiddleware, controller.block);
    router.get('/notifications', isAuthenticated, controller.notifications);
    router.post('/notifications/read-all', isAuthenticated, csrfMiddleware, controller.readAllNotifications);
    return router;
};
