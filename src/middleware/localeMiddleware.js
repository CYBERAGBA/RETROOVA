const { SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocaleFromPath, getLocaleFromCookie, getLocaleFromBrowser } = require('../i18n');

function localeMiddleware(req, res, next) {
  const requestedLocale = getLocaleFromPath(req.path || req.originalUrl || '/');
  const cookieLocale = getLocaleFromCookie(req);
  const hasExplicitLocalePath = !!(req.path || req.originalUrl || '').match(/^\/(fr|en)(?:\/|$)/);

  let locale = requestedLocale;

  if (hasExplicitLocalePath) {
    locale = requestedLocale;
  } else if (cookieLocale) {
    locale = cookieLocale;
  } else {
    locale = getLocaleFromBrowser(req) || DEFAULT_LOCALE;
  }

  if (!req.cookies) {
    req.cookies = {};
  }

  req.locale = locale;
  req.currentLanguage = locale;
  res.locals.req = req;
  res.locals.locale = locale;
  res.locals.currentLanguage = locale;

  next();
}

module.exports = localeMiddleware;
