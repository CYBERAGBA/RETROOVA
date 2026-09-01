const crypto = require('crypto');

function csrfMiddleware(req, res, next) {
    res.locals.siteUrl = res.locals.siteUrl || process.env.SITE_URL || process.env.BASE_URL || 'https://retroova.com';
    if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    res.locals.csrfToken = req.session.csrfToken;
    if (req.is('multipart/form-data') && (!req.body || Object.keys(req.body).length === 0)) return next();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body?._csrf !== req.session.csrfToken) {
        return res.status(403).render('403', { title: 'Requête refusée', message: 'Le formulaire a expiré. Rechargez la page puis réessayez.' });
    }
    next();
}

module.exports = csrfMiddleware;
