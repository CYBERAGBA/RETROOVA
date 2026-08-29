const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/userModel');

class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  /**
   * Valider les données d'inscription
   */
  validateRegistration(data) {
    const errors = [];

    // Email
    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email requis');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email invalide');
    }

    // Nom
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    // Mot de passe
    if (!data.password || data.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (data.password !== data.passwordConfirm) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    // Ville
    if (!data.city || data.city.trim().length === 0) {
      errors.push('Ville requise');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Enregistrer un nouvel utilisateur
   */
  async register(data) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hacher le mot de passe
    const passwordHash = await bcryptjs.hash(data.password, 10);

    // Créer l'utilisateur
    const userData = {
      id: uuidv4(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ? data.phone.trim() : null,
      passwordHash,
      city: data.city.trim()
    };

    return await this.userModel.create(userData);
  }

  /**
   * Connexion utilisateur
   */
  async login(email, password) {
    const user = await this.userModel.findByEmail(String(email).trim().toLowerCase());

    if (!user) {
      throw new Error('Identifiants invalides');
    }

    if (user.status === 'suspended') {
      throw new Error('Identifiants invalides');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Identifiants invalides');
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Valider un email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valider les données de connexion
   */
  validateLogin(data) {
    const errors = [];

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email requis');
    }

    if (!data.password || data.password.length === 0) {
      errors.push('Mot de passe requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Hacher le nouveau mot de passe
    const newPasswordHash = await bcryptjs.hash(newPassword, 10);

    // Mettre à jour dans la base (à implémenter dans UserModel)
    // Pour maintenant, c'est un placeholder
    return { success: true };
  }
}

module.exports = AuthService;
