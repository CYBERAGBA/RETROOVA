const express = require('express');
const AdminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const csrfMiddleware = require('../middleware/csrfMiddleware');

module.exports = (model, userModel) => {
    const router = express.Router();
    const controller = new AdminController(model);
    const requireAdmin = isAdmin(userModel);
    router.get('/admin', isAuthenticated, requireAdmin, controller.dashboard);
    router.post('/admin/reports/:id', isAuthenticated, requireAdmin, csrfMiddleware, controller.updateReport);
    router.post('/admin/users/:id/status', isAuthenticated, requireAdmin, csrfMiddleware, controller.updateUser);
    router.post('/admin/items/:id/status', isAuthenticated, requireAdmin, csrfMiddleware, controller.updateItem);
    return router;
};
