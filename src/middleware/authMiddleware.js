/**
 * Middleware pour vérifier si l'utilisateur est connecté
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  const returnTo = req.path.endsWith('/report') ? req.originalUrl : '';
  res.redirect(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login');
};

/**
 * Middleware pour vérifier si l'utilisateur est déjà connecté
 * Redirige vers le tableau de bord s'il l'est
 */
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  
  next();
};

/**
 * Middleware pour vérifier si l'utilisateur est admin
 */
const isAdmin = (userModel) => async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(403).render('403', { title: req.t('messages.forbidden', 'Accès refusé') });
  }

  try {
    const user = await userModel.findById(req.session.userId);
    if (user?.status === 'active' && user.role === 'admin') {
      req.session.role = user.role;
      return next();
    }
  } catch (error) {
    console.error('Erreur vérification droits admin:', error);
  }

  res.status(403).render('403', { title: req.t('messages.forbidden', 'Accès refusé') });
};

/**
 * Middleware pour attacher l'utilisateur à res.locals
 */
const attachUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.email,
      role: req.session.role
    };
  } else {
    res.locals.user = null;
  }
  
  next();
};

/**
 * Middleware pour logger les actions (audit)
 */
const auditLog = (action) => {
  return (req, res, next) => {
    // À implémenter plus tard avec logs dans la base de données
    console.log(`[AUDIT] ${action} - User: ${req.session?.userId || 'anonymous'} - IP: ${req.ip}`);
    next();
  };
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
  isAdmin,
  attachUser,
  auditLog
};
