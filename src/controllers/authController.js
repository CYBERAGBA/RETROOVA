const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');

class AuthController {
  constructor(userModel, itemModel = null, communicationModel = null) {
    this.userModel = userModel;
    this.itemModel = itemModel;
    this.communicationModel = communicationModel;
    this.authService = new AuthService(userModel);
  }

  /**
   * GET /register
   * Afficher le formulaire d'inscription
   */
  getRegister = (req, res) => {
    res.render('pages/register', { title: req.t('auth.registerTitle', 'Inscription'), formData: {} });
  };

  /**
   * POST /register
   * Traiter l'inscription
   */
  postRegister = async (req, res) => {
    try {
      const { name, email, password, passwordConfirm, phone, city } = req.body;

      // Valider les données
      const validation = this.authService.validateRegistration({
        name,
        email,
        password,
        passwordConfirm,
        phone,
        city
      });

      if (!validation.isValid) {
        return res.render('pages/register', {
          title: req.t('auth.registerTitle', 'Inscription'),
          errors: validation.errors,
          formData: { name, email, phone, city }
        });
      }

      // Enregistrer l'utilisateur
      const user = await this.authService.register({
        name,
        email,
        password,
        phone,
        city
      });

      // Rediriger avec message de succès
      res.redirect(`/login?message=${encodeURIComponent(req.t('messages.registrationSuccess', 'Inscription réussie. Veuillez vous connecter.'))}`);
    } catch (error) {
      console.error('Erreur inscription:', error);
      res.render('pages/register', {
        title: req.t('auth.registerTitle', 'Inscription'),
        errors: [error.message],
        formData: req.body
      });
    }
  };

  /**
   * GET /login
   * Afficher le formulaire de connexion
   */
  getLogin = (req, res) => {
    const message = req.query.message || '';
    res.render('pages/login', { title: req.t('auth.loginTitle', 'Connexion'), message, formData: {} });
  };

  /**
   * POST /login
   * Traiter la connexion
   */
  postLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Valider les données
      const validation = this.authService.validateLogin({ email, password });

      if (!validation.isValid) {
        return res.render('pages/login', {
          title: req.t('auth.loginTitle', 'Connexion'),
          errors: validation.errors,
          formData: { email }
        });
      }

      // Authentifier l'utilisateur
      const user = await this.authService.login(email, password);

      await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.city = user.city;

      // Rediriger selon le rôle
      const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Erreur connexion:', error);
      res.render('pages/login', {
        title: req.t('auth.loginTitle', 'Connexion'),
        errors: [error.message],
        formData: { email: req.body.email }
      });
    }
  };

  /**
   * GET /logout
   * Déconnexion
   */
  getLogout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur déconnexion:', err);
      }
      res.redirect(`/?message=${encodeURIComponent(req.t('messages.loggedOut', 'Vous avez été déconnecté'))}`);
    });
  };

  /**
   * GET /dashboard
   * Tableau de bord utilisateur
   */
  getDashboard = async (req, res) => {
    try {
      const user = await this.userModel.findById(req.session.userId);
      const stats = await this.userModel.getStats(req.session.userId);
      const reputation = await this.userModel.getReputation(req.session.userId);
      const lostCount = this.itemModel ? await this.itemModel.countByUser(req.session.userId, 'lost') : { count: 0 };
      const foundCount = this.itemModel ? await this.itemModel.countByUser(req.session.userId, 'found') : { count: 0 };
      const matches = this.itemModel ? await this.itemModel.getMatchesForUser(req.session.userId) : [];
      const messages = this.communicationModel ? await this.communicationModel.countMessages(req.session.userId) : 0;
      const items = this.itemModel ? await this.itemModel.findByUser(req.session.userId) : [];
      const notifications = this.communicationModel ? await this.communicationModel.getNotifications(req.session.userId) : [];
      const recentMessages = this.communicationModel ? await this.communicationModel.getConversations(req.session.userId) : [];
      const activity = [
        ...matches.map((match) => ({ type: 'match', title: req.t('dashboard.matchActivity', 'Correspondance potentielle'), detail: `${match.lost_title} · ${match.found_title}`, date: match.created_at })),
        ...notifications.map((notification) => ({ type: notification.type, title: notification.title, detail: notification.message, date: notification.created_at })),
        ...recentMessages.map((message) => ({ type: 'message', title: req.t('dashboard.messageReceived', 'Message reçu'), detail: message.subject || message.message, date: message.created_at }))
      ].sort((first, second) => new Date(second.date) - new Date(first.date)).slice(0, 5);

      res.render('pages/dashboard', {
        title: req.t('dashboard.title', 'Tableau de bord'),
        user,
        stats,
        reputation,
        itemStats: { lost: lostCount.count, found: foundCount.count, matches: matches.length, messages, returned: stats?.items_returned_count || 0 },
        items: items.slice(0, 5),
        activity
      });
    } catch (error) {
      console.error('Erreur tableau de bord:', error);
      res.render('pages/dashboard', {
        title: req.t('dashboard.title', 'Tableau de bord'),
        user: { name: req.t('dashboard.memberFallback', 'Membre RETROOVA') },
        itemStats: { lost: 0, found: 0, matches: 0, messages: 0, returned: 0 },
        items: [],
        activity: [],
        error: req.t('messages.dashboardError', 'Erreur lors du chargement du tableau de bord'),
        reputation: { level: req.t('dashboard.memberNew', 'Nouveau membre'), tone: 'standard' }
      });
    }
  };

  /**
   * GET /profile
   * Profil utilisateur
   */
  getProfile = async (req, res) => {
    try {
      const user = await this.userModel.findById(req.session.userId);
      const stats = await this.userModel.getStats(req.session.userId);
      const reputation = await this.userModel.getReputation(req.session.userId);
      const lostCount = this.itemModel ? await this.itemModel.countByUser(req.session.userId, 'lost') : { count: 0 };
      const foundCount = this.itemModel ? await this.itemModel.countByUser(req.session.userId, 'found') : { count: 0 };
      const matches = this.itemModel ? await this.itemModel.getMatchesForUser(req.session.userId) : [];
      const items = this.itemModel ? await this.itemModel.findByUser(req.session.userId) : [];
      const activity = matches.slice(0, 5).map((match) => ({ type: 'match', title: req.t('dashboard.matchActivity', 'Correspondance potentielle'), detail: `${match.lost_title} · ${match.found_title}`, date: match.created_at }));
      res.render('pages/profile', {
        title: req.t('profile.title', 'Mon profil'),
        user,
        stats,
        reputation,
        profileStats: { lost: lostCount.count, found: foundCount.count, returned: stats?.items_returned_count || 0, matches: matches.length },
        items: items.slice(0, 4),
        activity,
        message: req.query.message,
        error: req.query.error
      });
    } catch (error) {
      console.error('Erreur profil:', error);
      res.render('pages/profile', {
        title: req.t('profile.title', 'Mon profil'),
        user: { name: req.t('dashboard.profileFallback', 'Client'), email: '', city: '', phone: '' },
        stats: { items_found_count: 0, items_returned_count: 0, email_verified: 0, phone_verified: 0 },
        reputation: { level: req.t('dashboard.memberNew', 'Nouveau membre'), tone: 'standard' },
        profileStats: { lost: 0, found: 0, returned: 0, matches: 0 },
        items: [],
        activity: [],
        error: req.t('messages.profileError', 'Les informations du profil sont momentanément indisponibles.')
      });
    }
  };

  /**
   * POST /profile/update
   * Mettre à jour le profil
   */
  postProfileUpdate = async (req, res) => {
    try {
      const { name, phone, city } = req.body;
      if (!name || name.trim().length < 2 || name.trim().length > 100 || !city || city.trim().length < 2 || city.trim().length > 100) {
        return res.redirect(`/profile?error=${encodeURIComponent(req.t('messages.invalidProfile', 'Le nom et la ville doivent être valides'))}`);
      }

      await this.userModel.updateProfile(req.session.userId, {
        name,
        phone,
        city
      });

      // Mettre à jour la session
      req.session.userName = name;
      req.session.city = city;

      res.redirect(`/profile?message=${encodeURIComponent(req.t('messages.profileUpdated', 'Profil mis à jour avec succès'))}`);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      res.redirect(`/profile?error=${encodeURIComponent(req.t('messages.updateError', 'Erreur lors de la mise à jour'))}`);
    }
  };
}

module.exports = AuthController;
