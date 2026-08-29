# RETROVA

Lost. Found. Returned.

RETROVA est une plateforme web dédiée à la signalisation, à la recherche et à la restitution d’objets perdus et trouvés. L’objectif est simple : mettre en relation les personnes qui ont perdu un bien avec celles qui l’ont retrouvé, de manière rapide, claire et sécurisée.

## Aperçu du projet

Cette application a été conçue pour offrir une expérience fluide aux utilisateurs qui souhaitent :

- déclarer un objet perdu ou trouvé ;
- rechercher des annonces filtrées par catégorie, localisation et mot-clé ;
- comparer des éléments potentiellement correspondants ;
- communiquer avec d’autres utilisateurs via une messagerie interne ;
- signaler des contenus suspects ou frauduleux ;
- gérer un espace sécurisé avec un accès admin dédié.

---

## Fonctionnalités principales

### Utilisateur

- Inscription et connexion sécurisées
- Gestion de profil et paramètres utilisateur
- Déclaration d’objets perdus et trouvés
- Recherche avancée avec filtres
- Matching intelligent entre objets perdus et trouvés
- Messagerie interne et notifications
- Signalement des annonces suspectes
- Interface responsive et mobile-friendly

### Administration

- Panneau d’administration dédié
- Gestion des contenus et des signalements
- Suivi des utilisateurs et des annonces
- Contrôle des éléments signalés et des validations

### Sécurité

- Hachage des mots de passe avec bcrypt
- Sessions utilisateur sécurisées
- Middleware d’authentification
- Limitation de débit et protection du backend
- Validation de fichiers uploadés

---

## Stack technique

| Catégorie | Technologie |
|---|---|
| Backend | Node.js + Express.js |
| Base de données | SQLite |
| Templates | EJS |
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Authentification | bcryptjs + express-session |
| Sécurité | Helmet, express-rate-limit |
| Uploads | multer |
| Déploiement | compatible Node.js / plateforme cloud |

---

## Structure du projet

```text
retrova/
├── server.js
├── package.json
├── README.md
├── database/
│   └── schema.sql
├── scripts/
│   └── initDb.js
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── public/
│   ├── css/
│   ├── images/
│   └── js/
├── views/
│   ├── layouts/
│   ├── pages/
│   └── partials/
├── uploads/
├── test/
│   └── smoke.test.js
└── .env.example
```

---

## Prérequis

Avant de lancer le projet, assure-toi d’avoir installé :

- Node.js 18+ ou version compatible
- npm
- Git

---

## Installation

1. Clone le dépôt :

```bash
git clone <url-du-repo>
cd retrova
```

2. Installe les dépendances :

```bash
npm install
```

3. Initialise la base de données :

```bash
npm run init-db
```

4. Démarre l’application en mode développement :

```bash
npm run dev
```

Le site est ensuite accessible sur :

```text
http://localhost:3000
```

---

## Configuration

Crée un fichier `.env` à la racine du projet. Tu peux te baser sur les variables suivantes :

```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=change_this_secret_in_production
DATABASE_PATH=./database/database.sqlite
BASE_URL=http://localhost:3000
```

> En production, la clé de session et les identifiants sensibles doivent être remplacés par des valeurs sécurisées.

---

## Scripts disponibles

```bash
npm run dev
```
Démarre l’application avec rechargement automatique.

```bash
npm start
```
Démarre l’application en mode production.

```bash
npm run init-db
```
Initialise la base SQLite et le schéma principal.

```bash
npm test
```
Lance les tests de validation disponibles.

---

## Flux utilisateur

### Inscription

- L’utilisateur crée son compte depuis la page d’inscription.
- Les informations sont validées côté serveur.
- Le mot de passe est hashé avant stockage.

### Déclaration d’objet

- L’utilisateur choisit entre une annonce “perdue” ou “trouvée”.
- Il renseigne les informations pertinentes, comme les détails, le lieu et les photos.
- L’annonce est sauvegardée et peut être retrouvée dans les recherches.

### Recherche et matching

- Les objets sont filtrés par mots-clés, catégorie et ville.
- Le système cherche des correspondances plausibles entre annonces perdues et trouvées.
- Le matching est présenté comme une piste, pas comme une certitude.

---

## Sécurité

Le projet a été pensé avec une logique de sécurité appliquée au niveau des points critiques :

- mot de passe hashé avant stockage ;
- contrôle d’authentification via middleware ;
- protection des routes sensibles ;
- validation des données utilisateur ;
- limitation de requêtes côté serveur ;
- gestion des uploads avec seuils de sécurité.

---

## Déploiement

Le projet est prêt pour un déploiement sur des plateformes compatibles Node.js comme :

- Railway
- Render
- Heroku
- VPS Linux
- Docker / environnement containerisé

Avant tout déploiement en production, il est recommandé de :

- utiliser des variables d’environnement réelles ;
- mettre en place HTTPS ;
- sécuriser les sessions ;
- configurer un stockage de fichiers fiable ;
- activer les logs et le monitoring.

---

## Roadmap

### Version actuelle

- inscription / connexion
- gestion de profil
- annonces perdues / trouvées
- recherche filtrée
- messagerie interne
- notifications
- signalements
- administration

### Améliorations prévues

- vérification d’email et de téléphone
- validations plus poussées sur les annonces
- amélioration du matching et du scoring
- carte interactive plus détaillée
- SEO et optimisation de l’indexation
- support multilingue (FR / EN)
- tests automatisés plus complets

---

## Contribution

Les contributions sont les bienvenues. Si tu souhaites participer au projet :

1. fork le dépôt ;
2. crée une branche de fonctionnalité ;
3. applique tes changements ;
4. ouvre une pull request avec une description claire.

---

## Licence

Ce projet est distribué sous licence MIT.

---

## À propos

RETROVA vise à transformer la recherche d’objets perdus en une expérience plus rapide, plus humaine et plus trustable. Le projet s’inscrit dans une logique de restitution concrète, avec une interface simple, des fonctionnalités utiles et une base technique claire et extensible.

---

## Contact

Pour toute question ou proposition, tu peux te rapprocher du mainteneur du projet ou utiliser les canaux de contact disponibles dans l’application ou sur le dépôt GitHub.


## 🔐 Sécurité

### Implémentée

✅ Mots de passe hashés avec bcryptjs (salt rounds: 10)
✅ Sessions sécurisées avec express-session
✅ Middleware d'authentification
✅ Validation des données côté serveur
✅ Helmet et limitation de débit
✅ Validation des uploads image (5 Mo, MIME autorisés)
✅ Contrôle des permissions utilisateur/admin

### Renforcements prévus

- Protection CSRF complète sur tous les formulaires
- Sanitization XSS
- Stockage de session persistant en production
- HTTPS/SSL enforcement
- Vérification email
- Vérification téléphone
- Audit logging complet
- 2FA (Two-factor authentication)

---

## 🌐 Routes disponibles

### Public (sans connexion)

```
GET  /                          → Accueil
GET  /register                  → Formulaire inscription
POST /register                  → Créer un compte
GET  /login                     → Formulaire connexion
POST /login                     → Se connecter
```

### Protégées (connexion requise)

```
GET  /logout                    → Déconnexion
GET  /dashboard                 → Tableau de bord
GET  /profile                   → Mon profil
POST /profile/update            → Mettre à jour profil
```

### Routes Phase 2 à 4

```
GET  /lost/create               → Créer annonce perdue
POST /lost/create               → Soumettre annonce
GET  /found/create              → Créer annonce trouvée
POST /found/create              → Soumettre annonce
GET  /search                    → Rechercher
GET  /lost/:id                  → Détail annonce perdue
GET  /found/:id                 → Détail annonce trouvée
GET  /matches                   → Mes correspondances
GET  /messages                  → Messagerie
GET  /notifications             → Notifications
GET  /map                       → Carte Leaflet/OpenStreetMap
GET  /items/:id/report          → Signaler une annonce
GET  /admin                     → Panneau administrateur
```

---

## 🐛 Dépannage

### La base de données n'est pas créée

```bash
npm run init-db
```

### Erreur "Session secret not configured"

Vérifier que `SESSION_SECRET` est défini dans `.env`

### Port déjà utilisé

```bash
# Utiliser un autre port
PORT=3001 npm start
```

### Problèmes de modules

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Déploiement

### Heroku

```bash
# Créer une app Heroku
heroku create your-app-name

# Configurer les variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Déployer
git push heroku main
```

### Railway

```bash
# Railway auto-détecte Node.js
# Juste configurer les variables d'environnement dans le dashboard
```

### VPS Linux

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner et installer
git clone your-repo
cd retrova
npm install
npm run init-db

# Utiliser PM2 pour garder en vie
npm install -g pm2
pm2 start server.js --name "retrova"
pm2 startup
pm2 save
```

---

## 🎯 Prochaines étapes

### Phase 2 à 4 : intégrées
- [x] Annonces perdues/trouvées, recherche et matching
- [x] Notifications et messagerie interne
- [x] Signalements, preuves de propriété et panneau admin
- [x] Carte approximative et responsive mobile-first

### Phase 3 : Communication
- [ ] Messagerie interne
- [ ] Preuves de propriété
- [ ] Signalements

### Phase 4 : Administration & Polish
- [ ] Panneau administrateur
- [ ] Gestion des utilisateurs
- [ ] Cartographie (OpenStreetMap)
- [ ] Optimisations SEO
- [ ] Multilingue (FR/EN)

### Phase 5+ : Croissance
- [ ] Application mobile
- [ ] IA de matching avancée
- [ ] QR codes
- [ ] Partenariats
- [ ] International

---

## 📝 Spécifications complètes

Consultez la documentation complète : `SPEC.md` (fournie séparément)

---

## 👨‍💻 Développement

### Styleguide

- **Nommage** : camelCase pour JS, kebab-case pour CSS/HTML
- **Indentation** : 2 espaces
- **Commentaires** : JSDoc pour les fonctions importantes
- **Commits** : Messages descriptifs en français

### Commandes utiles

```bash
# Développement
npm run dev

# Initialiser la BDD
npm run init-db

# Seed avec données de test
npm run seed-db

# Linter (à ajouter)
npm run lint

# Tests (à ajouter)
npm test
```

---

## 📄 Licence

MIT - Libre d'utilisation

---

## 👤 Auteur

**Agba Odessi Raoul**
- 🌐 [OraWeb Studio](https://ci-oraweb.com)
- 📧 [contact@oraweb.ci](mailto:contact@oraweb.ci)
- 📍 Abidjan, Côte d'Ivoire

---

## 💬 Support

Pour les questions ou problèmes :

1. Vérifier la documentation
2. Consulter les logs (console)
3. Vérifier les variables d'environnement
4. Réinitialiser la base de données

---

**RETROVA V1 - Lost. Found. Returned.** ✅

Plateforme développée avec soin pour retrouver ce qu'on a perdu.
#   R E T R O O V A  
 