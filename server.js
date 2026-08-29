const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const UserModel = require('./src/models/userModel');
const ItemModel = require('./src/models/itemModel');
const CommunicationModel = require('./src/models/communicationModel');
const AdminModel = require('./src/models/adminModel');
const authRoutes = require('./src/routes/authRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const communicationRoutes = require('./src/routes/communicationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const infoRoutes = require('./src/routes/infoRoutes');
const { attachUser } = require('./src/middleware/authMiddleware');
const csrfMiddleware = require('./src/middleware/csrfMiddleware');
const {
  buildAbsoluteUrl,
  buildSitemapXml,
  buildWebSiteSchema,
  buildFaqSchema,
  buildLanguageAlternates
} = require('./src/services/seoService');

// ============================================
// Configuration
// ============================================

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SITE_URL = process.env.SITE_URL || 'https://retroova.com';
const DATABASE_PATH = path.resolve(__dirname, process.env.DATABASE_PATH || './database/database.sqlite');
const SESSION_SECRET = process.env.SESSION_SECRET;

app.disable('x-powered-by');
app.set('trust proxy', Number(process.env.TRUST_PROXY || (NODE_ENV === 'production' ? 1 : 0)));

if (!SESSION_SECRET && NODE_ENV === 'production') {
  console.error('SESSION_SECRET doit être configuré en production.');
  process.exit(1);
}

// ============================================
// Vérifier que la base de données existe
// ============================================

if (!fs.existsSync(DATABASE_PATH)) {
  console.error(`\n⚠️  Base de données non trouvée à ${DATABASE_PATH}`);
  console.error('Veuillez exécuter: npm run init-db\n');
  process.exit(1);
}

// ============================================
// Configuration Express
// ============================================

// Moteur de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /profile\nDisallow: /messages\nDisallow: /notifications\nDisallow: /login\nDisallow: /register\nSitemap: ${buildAbsoluteUrl(SITE_URL, '/sitemap.xml')}\n`);
});

app.get('/sitemap.xml', async (req, res) => {
  const publicPages = [
    { url: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
    { url: '/search', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.9' },
    { url: '/map', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.8' },
    { url: '/how-it-works', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.8' },
    { url: '/about', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.7' },
    { url: '/privacy', lastmod: new Date().toISOString(), changefreq: 'yearly', priority: '0.5' },
    { url: '/terms', lastmod: new Date().toISOString(), changefreq: 'yearly', priority: '0.5' },
    { url: '/contact', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
    { url: '/help', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.7' },
    { url: '/security', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.6' },
    { url: '/login', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.4' },
    { url: '/register', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.4' }
  ];

  const items = await itemModel.all("SELECT id, title, type, created_at, updated_at FROM items WHERE status NOT IN ('closed', 'expired') ORDER BY created_at DESC LIMIT 500");
  const xml = buildSitemapXml(SITE_URL, publicPages, items);
  res.type('application/xml').send(xml);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes. Réessayez plus tard.'
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Sessions sécurisées
app.use(session({
  secret: SESSION_SECRET || 'development-only-session-secret',
  resave: false,
  saveUninitialized: false,
  proxy: NODE_ENV === 'production',
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
// Attacher les données utilisateur aux templates
app.use(attachUser);
app.use(csrfMiddleware);

// ============================================
// Models
// ============================================

const userModel = new UserModel(DATABASE_PATH);
const itemModel = new ItemModel(DATABASE_PATH);
const communicationModel = new CommunicationModel(DATABASE_PATH);
const adminModel = new AdminModel(DATABASE_PATH);

app.use(async (req, res, next) => {
  if (!req.session?.userId) return next();
  try {
    const user = await userModel.findById(req.session.userId);
    if (!user || user.status !== 'active') {
      req.session.userId = undefined;
      req.session.userName = undefined;
      req.session.email = undefined;
      req.session.role = undefined;
      req.session.city = undefined;
      res.locals.user = null;
    }
  } catch (error) {
    console.error('Erreur vérification session:', error);
  }
  next();
});

app.use(async (req, res, next) => {
  try {
    res.locals.unreadNotifications = req.session?.userId ? await communicationModel.countUnread(req.session.userId) : 0;
    next();
  } catch (error) {
    console.error('Erreur notifications:', error);
    res.locals.unreadNotifications = 0;
    next();
  }
});

app.use((req, res, next) => {
  const currentPath = req.originalUrl.split('?')[0] || '/';
  const localeAlternates = buildLanguageAlternates(SITE_URL, currentPath, ['fr', 'en']);
  const currentLang = req.path.startsWith('/en') ? 'en' : 'fr';

  res.locals.siteUrl = SITE_URL;
  res.locals.canonicalUrl = buildAbsoluteUrl(SITE_URL, currentPath);
  res.locals.lang = currentLang;
  res.locals.htmlLang = currentLang;
  res.locals.localeAlternates = localeAlternates;
  res.locals.alternateLinks = Object.entries(localeAlternates).map(([locale, href]) => `\n    <link rel="alternate" hreflang="${locale}" href="${href}">`).join('');
  next();
});

// ============================================
// Routes
// ============================================

// Routes d'authentification
app.use('/', authRoutes(userModel, itemModel, communicationModel));
app.use('/', itemRoutes(itemModel, communicationModel, userModel));
app.use('/', communicationRoutes(communicationModel, itemModel, userModel));
app.use('/', adminRoutes(adminModel, userModel));
app.use('/', infoRoutes());

/**
 * Health check pour Railway et les monitorings
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Page d'accueil
app.get('/', async (req, res) => {
  const publicStats = await itemModel.getPublicStats();
  const canonicalUrl = buildAbsoluteUrl(SITE_URL, '/');
  res.render('pages/index', {
    title: 'RETROOVA — Objets perdus et trouvés',
    lang: 'fr',
    metaDescription: 'RETROOVA aide à retrouver les objets perdus et à remettre en contact les personnes qui ont trouvé un bien avec son propriétaire. Publiez une annonce, recherchez rapidement et récupérez ce qui vous appartient.',
    publicStats,
    canonicalUrl,
    ogImage: buildAbsoluteUrl(SITE_URL, '/images/logo_nom_slogan_paysage.png'),
    schemaJsonLd: buildWebSiteSchema(SITE_URL, 'fr')
  });
});

app.get('/en', async (req, res) => {
  const publicStats = await itemModel.getPublicStats();
  const canonicalUrl = buildAbsoluteUrl(SITE_URL, '/en');
  res.render('pages/index', {
    title: 'RETROOVA — Lost and found objects',
    lang: 'en',
    metaDescription: 'RETROOVA helps people recover lost items and reconnect found belongings with their owners through a safe and simple search process.',
    publicStats,
    canonicalUrl,
    ogImage: buildAbsoluteUrl(SITE_URL, '/images/logo_nom_slogan_paysage.png'),
    schemaJsonLd: buildWebSiteSchema(SITE_URL, 'en')
  });
});

// Page 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).render('500', {
    title: 'Erreur serveur',
    error: NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// ============================================
// Démarrage du serveur
// ============================================

const startServer = () => app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║         RETROVA V1 - Phase 1           ║
╚════════════════════════════════════════╝

✅ Serveur démarré avec succès
📍 Bind: ${HOST}:${PORT}
🔧 Environnement: ${NODE_ENV}
💾 Base de données: ${DATABASE_PATH}

📋 Routes disponibles:
  - GET  /health            → Vérification de santé
  - GET  /                  → Accueil
  - GET  /register          → Inscription
  - POST /register          → Créer un compte
  - GET  /login             → Connexion
  - POST /login             → Se connecter
  - GET  /logout            → Déconnexion
  - GET  /dashboard         → Tableau de bord (protégé)
  - GET  /profile           → Profil (protégé)
  - POST /profile/update    → Mettre à jour profil (protégé)

⚡ Pour développement: npm run dev
  `);
});

if (require.main === module) {
  userModel.ensurePublicIds().then(startServer).catch((error) => {
    console.error('Impossible de préparer les identifiants publics:', error);
    process.exit(1);
  });
}

module.exports = app;
