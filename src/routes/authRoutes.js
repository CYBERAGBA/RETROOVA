const express = require('express');
const AuthController = require('../controllers/authController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/authMiddleware');
const csrfMiddleware = require('../middleware/csrfMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de tentatives de connexion. Réessayez plus tard.'
});

module.exports = (userModel, itemModel, communicationModel) => {
  const authController = new AuthController(userModel, itemModel, communicationModel);

  // ============================================
  // Routes publiques (non authentifiées)
  // ============================================

  router.get('/register', isNotAuthenticated, authController.getRegister);
  router.post('/register', isNotAuthenticated, csrfMiddleware, authController.postRegister);

  router.get('/login', isNotAuthenticated, authController.getLogin);
  router.post('/login', loginRateLimit, isNotAuthenticated, csrfMiddleware, authController.postLogin);

  // ============================================
  // Routes protégées (authentifiées)
  // ============================================

  router.get('/logout', authController.getLogout);

  router.get('/dashboard', isAuthenticated, authController.getDashboard);

  router.get('/profile', isAuthenticated, authController.getProfile);
  router.post('/profile/update', isAuthenticated, csrfMiddleware, authController.postProfileUpdate);

  return router;
};
