const express = require('express');
const InfoController = require('../controllers/infoController');
const csrfMiddleware = require('../middleware/csrfMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const contactDirectory = path.resolve(process.env.CONTACT_UPLOADS_DIR || path.join(__dirname, '../../private-uploads/contact'));
fs.mkdirSync(contactDirectory, { recursive: true });
const contactUpload = multer({
    storage: multer.diskStorage({
        destination: contactDirectory,
        filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf' })[file.mimetype]}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']).has(file.mimetype)) {
            const error = new Error('Invalid contact attachment.');
            error.code = 'INVALID_CONTACT_ATTACHMENT';
            return callback(error);
        }
        callback(null, true);
    }
});
const contactRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const uploadContactAttachment = (req, res, next) => contactUpload.single('attachment')(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'INVALID_CONTACT_ATTACHMENT') return res.status(422).redirect(`${req.baseUrl}/contact?error=attachment`);
    next(error);
});

module.exports = (adminModel) => {
    const router = express.Router();
    const controller = new InfoController(adminModel);
    ['/how-it-works', '/about', '/privacy', '/terms', '/security', '/help'].forEach((route) => router.get(route, controller.show));
    ['/partnerships', '/partenariats'].forEach((route) => { router.get(route, controller.show); router.post(route, csrfMiddleware, controller.submitPartnership); });
    router.get('/contact', controller.contact);
    router.post('/contact', contactRateLimit, uploadContactAttachment, csrfMiddleware, controller.submitContact);
    return router;
};
