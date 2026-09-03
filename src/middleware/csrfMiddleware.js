const crypto = require('crypto');
const { removeLocalUpload } = require('../services/imageStorage');

async function csrfMiddleware(req, res, next) {
    res.locals.siteUrl = res.locals.siteUrl || process.env.SITE_URL || process.env.BASE_URL || 'https://retroova.com';
    if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    res.locals.csrfToken = req.session.csrfToken;
    if (req.is('multipart/form-data') && (!req.body || Object.keys(req.body).length === 0)) return next();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body?._csrf !== req.session.csrfToken) {
        await removeLocalUpload(req.file);
        return res.status(403).render('403', { title: req.t('messages.requestRefused', 'Requête refusée'), message: req.t('messages.csrfExpired', 'Le formulaire a expiré. Rechargez la page puis réessayez.') });
    }
    next();
}

module.exports = csrfMiddleware;
