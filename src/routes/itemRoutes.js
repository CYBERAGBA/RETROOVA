const express = require('express');
const ItemController = require('../controllers/itemController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const csrfMiddleware = require('../middleware/csrfMiddleware');
const { categories, categoryLabels } = require('../services/itemService');
const { cloudinaryConfigured, cloudinaryRequired, storeImage, removeLocalUpload, sensitiveCategories } = require('../services/imageStorage');
const reportRateLimit = require('express-rate-limit')({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

const uploadDirectory = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads'));
const privateReportDirectory = path.resolve(process.env.REPORT_UPLOADS_DIR || path.join(__dirname, '../../private-uploads/reports'));
fs.mkdirSync(uploadDirectory, { recursive: true });
fs.mkdirSync(privateReportDirectory, { recursive: true });
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PHOTO_SIZE_LABEL = '5 Mo';
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const upload = multer({
    storage: cloudinaryConfigured || cloudinaryRequired ? multer.memoryStorage() : multer.diskStorage({ destination: uploadDirectory }),
    limits: { fileSize: MAX_PHOTO_SIZE },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
            const error = new Error('Invalid image type.');
            error.code = 'INVALID_IMAGE_TYPE';
            return callback(error);
        }
        return callback(null, true);
    }
});
const reportUpload = multer({
    storage: multer.diskStorage({
        destination: privateReportDirectory,
        filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${({ 'image/jpeg': '.jpg', 'image/png': '.png', 'application/pdf': '.pdf' })[file.mimetype]}`)
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!new Set(['image/jpeg', 'image/png', 'application/pdf']).has(file.mimetype) || !allowedExtensions.has(path.extname(file.originalname).toLowerCase()) && file.mimetype !== 'application/pdf') {
            const error = new Error('Invalid report attachment.');
            error.code = 'INVALID_REPORT_ATTACHMENT';
            return callback(error);
        }
        return callback(null, true);
    }
});

const uploadReportAttachment = (req, res, next) => reportUpload.single('attachment')(req, res, (error) => {
    if (!error) return next();
    removeLocalUpload(req.file);
    if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'INVALID_REPORT_ATTACHMENT') {
        const itemId = req.params.id || req.body.itemId || '';
        const reportPath = itemId ? `/items/${encodeURIComponent(itemId)}/report` : '/report';
        return res.redirect(`${req.baseUrl}${reportPath}?error=${encodeURIComponent(req.t('report.invalidAttachment', 'La pièce jointe est invalide ou dépasse 2 Mo.'))}`);
    }
    return next(error);
});

const uploadPhoto = (type, isEdit = false) => (req, res, next) => upload.single('photo')(req, res, async (error) => {
    if (!error) {
        try {
            req.storedImage = await storeImage(req.file, { sensitive: sensitiveCategories.has(req.body.category) });
            return next();
        } catch (storageError) {
            await removeLocalUpload(req.file);
            error = storageError;
        }
    }
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).render('pages/item-form', {
            title: type === 'found' ? req.t('itemForm.publishFound', 'Declare a found item') : req.t('itemForm.publishLost', 'Declare a lost item'),
            formData: { ...req.body, type: type || req.body.type || 'lost' },
            categories,
            categoryLabels,
            errors: [req.t('itemForm.photoTooLarge', `The photo is too large. The maximum allowed size is ${MAX_PHOTO_SIZE_LABEL}.`)],
            isEdit,
            itemId: req.params.id
        });
    }
    if (error?.code === 'INVALID_IMAGE_TYPE') {
        return res.status(422).render('pages/item-form', {
            title: req.t('itemForm.publishAd', 'Nouvelle annonce'),
            formData: { ...req.body, type: type || req.body.type || 'lost' },
            categories,
            categoryLabels,
            errors: [req.t('itemForm.invalidPhoto', 'The file must be a JPG, PNG, GIF, or WebP image.')],
            isEdit,
            itemId: req.params.id
        });
    }
    if (error?.code === 'CLOUDINARY_NOT_CONFIGURED' || error?.code === 'SENSITIVE_IMAGE_PROTECTION_FAILED' || error?.name === 'Error') {
        console.error('Erreur stockage image:', error);
        return res.status(503).render('pages/item-form', {
            title: req.t('itemForm.publishAd', 'Nouvelle annonce'),
            formData: { ...req.body, type: type || req.body.type || 'lost' },
            categories,
            categoryLabels,
            errors: [req.t('itemForm.photoUploadError', 'The image could not be uploaded. Please try again.')],
            isEdit,
            itemId: req.params.id
        });
    }
    return next(error);
});

module.exports = (itemModel, communicationModel, userModel) => {
    const router = express.Router();
    const controller = new ItemController(itemModel, communicationModel, userModel);

    router.get('/search', controller.search);
    router.get('/map', controller.map);
    router.get('/lost', (req, res) => controller.listPublic(req, res, 'lost'));
    router.get('/found', (req, res) => controller.listPublic(req, res, 'found'));
    router.get('/lost/create', isAuthenticated, (req, res) => { req.params.type = 'lost'; controller.showCreate(req, res); });
    router.post('/lost/create', isAuthenticated, uploadPhoto('lost'), csrfMiddleware, (req, res) => { req.params.type = 'lost'; controller.create(req, res); });
    router.get('/found/create', isAuthenticated, (req, res) => { req.params.type = 'found'; controller.showCreate(req, res); });
    router.post('/found/create', isAuthenticated, uploadPhoto('found'), csrfMiddleware, (req, res) => { req.params.type = 'found'; controller.create(req, res); });
    router.get('/lost/my-items', isAuthenticated, (req, res) => { req.params.type = 'lost'; controller.listMine(req, res); });
    router.get('/found/my-items', isAuthenticated, (req, res) => { req.params.type = 'found'; controller.listMine(req, res); });
    router.get('/items/:id', controller.show);
    router.get('/lost/:id', controller.show);
    router.get('/found/:id', controller.show);
    router.get('/items/:id/edit', isAuthenticated, controller.edit);
    router.post('/items/:id/update', isAuthenticated, uploadPhoto(null, true), csrfMiddleware, controller.update);
    router.post('/items/:id/status', isAuthenticated, csrfMiddleware, controller.changeStatus);
    router.post('/items/:id/delete', isAuthenticated, csrfMiddleware, controller.remove);
    router.get('/items/:id/report', isAuthenticated, controller.report);
    router.get('/report', isAuthenticated, controller.reportGeneric);
    router.post('/items/:id/report', isAuthenticated, reportRateLimit, uploadReportAttachment, csrfMiddleware, controller.submitReport);
    router.post('/report', isAuthenticated, reportRateLimit, uploadReportAttachment, csrfMiddleware, controller.submitReport);
    router.post('/items/:id/proof', isAuthenticated, csrfMiddleware, controller.submitProof);
    router.get('/matches', isAuthenticated, controller.matches);
    router.post('/matches/:id/accept', isAuthenticated, csrfMiddleware, controller.acceptMatch);
    router.post('/matches/:id/reject', isAuthenticated, csrfMiddleware, controller.rejectMatch);
    router.post('/matches/:id/returned', isAuthenticated, csrfMiddleware, controller.confirmReturned);

    return router;
};
