const fs = require('fs');
const path = require('path');

const DEFAULT_LOCALE = 'fr';
const SUPPORTED_LOCALES = ['fr', 'en'];
const LOCALES_DIR = path.join(__dirname, '../../locales');

function readLocaleFile(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getLocaleFromPath(pathname) {
  if (!pathname) return DEFAULT_LOCALE;
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  const firstSegment = normalized.split('/')[0];
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    return firstSegment;
  }
  return DEFAULT_LOCALE;
}

function getLocaleFromCookie(req) {
  const cookieValue = req?.cookies?.locale;
  if (cookieValue && SUPPORTED_LOCALES.includes(cookieValue)) {
    return cookieValue;
  }
  return null;
}

function getLocaleFromBrowser(req) {
  const header = req?.headers?.['accept-language'];
  if (!header) return DEFAULT_LOCALE;

  const preferred = header
    .split(',')
    .map((part, index) => {
      const [languageTag, ...parameters] = part.trim().toLowerCase().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
      return { language: languageTag.split('-')[0], quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter(({ quality }) => quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index)
    .find(({ language }) => SUPPORTED_LOCALES.includes(language))?.language;

  return preferred || DEFAULT_LOCALE;
}

function getLocale(req) {
  const fromPath = getLocaleFromPath(req.path || req.originalUrl || '/');
  if (fromPath !== DEFAULT_LOCALE || req.path?.startsWith('/fr') || req.path?.startsWith('/en')) {
    const localeFromPath = getLocaleFromPath(req.path || req.originalUrl || '/');
    if (SUPPORTED_LOCALES.includes(localeFromPath)) return localeFromPath;
  }

  const fromCookie = getLocaleFromCookie(req);
  if (fromCookie) return fromCookie;

  return getLocaleFromBrowser(req);
}

function translate(locale, key, fallback = '') {
  const locales = readLocaleFile(locale);
  const segments = key.split('.');
  let value = locales;

  for (const segment of segments) {
    if (!value || typeof value !== 'object' || !(segment in value)) {
      value = undefined;
      break;
    }
    value = value[segment];
  }

  if (value === undefined || value === null) {
    const fallbackLocales = readLocaleFile(DEFAULT_LOCALE);
    let fallbackValue = fallbackLocales;
    for (const segment of segments) {
      if (!fallbackValue || typeof fallbackValue !== 'object' || !(segment in fallbackValue)) {
        fallbackValue = undefined;
        break;
      }
      fallbackValue = fallbackValue[segment];
    }
    return fallbackValue ?? fallback;
  }

  return String(value);
}

function setLocaleCookie(res, locale) {
  if (!res || !locale || !SUPPORTED_LOCALES.includes(locale)) {
    return;
  }

  res.cookie('locale', locale, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
}

function i18nMiddleware(req, res, next) {
  const locale = getLocale(req);
  const translations = readLocaleFile(locale);

  if (req.cookies?.locale !== locale) {
    setLocaleCookie(res, locale);
  }

  req.locale = locale;
  req.currentLanguage = locale;
  req.t = (key, fallback = '') => translate(locale, key, fallback);
  res.locals.locale = locale;
  res.locals.currentLanguage = locale;
  res.locals.translations = translations;
  res.locals.t = (key, fallback = '') => translate(locale, key, fallback);

  next();
}

module.exports = {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocale,
  getLocaleFromPath,
  getLocaleFromCookie,
  getLocaleFromBrowser,
  setLocaleCookie,
  translate,
  i18nMiddleware
};
