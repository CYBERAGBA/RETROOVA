const express = require('express');
const ItemController = require('../controllers/itemController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csrfMiddleware = require('../middleware/csrfMiddleware');
const { categories, categoryLabels } = require('../services/itemService');

const uploadDirectory = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads'));
fs.mkdirSync(uploadDirectory, { recursive: true });
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PHOTO_SIZE_LABEL = '5 Mo';
const upload = multer({ dest: uploadDirectory, limits: { fileSize: MAX_PHOTO_SIZE }, fileFilter: (req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) });

const uploadPhoto = (type) => (req, res, next) => upload.single('photo')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).render('pages/item-form', {
            title: type === 'found' ? 'Déclarer un objet trouvé' : 'Déclarer un objet perdu',
            formData: { ...req.body, type },
            categories,
            categoryLabels,
            errors: [`La photo est trop volumineuse. La taille maximale autorisée est de ${MAX_PHOTO_SIZE_LABEL}.`],
            isEdit: false
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
    router.post('/items/:id/update', isAuthenticated, upload.single('photo'), csrfMiddleware, controller.update);
    router.post('/items/:id/status', isAuthenticated, csrfMiddleware, controller.changeStatus);
    router.post('/items/:id/delete', isAuthenticated, csrfMiddleware, controller.remove);
    router.get('/items/:id/report', isAuthenticated, controller.report);
    router.post('/items/:id/report', isAuthenticated, csrfMiddleware, controller.submitReport);
    router.post('/items/:id/proof', isAuthenticated, csrfMiddleware, controller.submitProof);
    router.get('/matches', isAuthenticated, controller.matches);
    router.post('/matches/:id/accept', isAuthenticated, csrfMiddleware, controller.acceptMatch);
    router.post('/matches/:id/reject', isAuthenticated, csrfMiddleware, controller.rejectMatch);
    router.post('/matches/:id/returned', isAuthenticated, csrfMiddleware, controller.confirmReturned);

    return router;
};
