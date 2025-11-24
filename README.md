# API Formation – Documentation pour le Front-End

## Authentification

### Connexion
- **POST** `/api/userLogin/login`
 # project_formation

 README en français — API de gestion des formations, utilisateurs et réservations.

 ## Description

 Ce projet fournit une API REST pour gérer des formations (création, modification, suppression), des utilisateurs (inscription, authentification, gestion de profil) et des réservations de formation. L'application inclut un système de validation par code (email), réinitialisation de mot de passe, envoi d'emails via `nodemailer`, et des vues EJS pour certaines pages (mot de passe oublié / réinitialisation).

 Le projet se trouve à la racine avec les fichiers principaux suivants :

 - `app.js` : point d'entrée de l'application.
 - `db.js` : connexion à la base de données MongoDB.
 - `seeder.js` : script d'initialisation / remplissage de la base de données.
 - Dossiers importants : `controllers/`, `models/`, `routes/`, `middleware/`, `views/`, `utils/`.

 ## Fonctionnalités principales

 - Authentification : inscription avec validation par code, connexion, déconnexion.
 - Gestion des utilisateurs : listing (filtrage), modification de profil, changement de statut (admin), suppression.
 - Gestion des formations : CRUD complet pour les formations (admin pour créer/modifier/supprimer).
 - Réservations : employés peuvent demander des réservations ; les admins confirment/annulent et reçoivent des notifications par mail. Gestion des places disponibles (décrémentation/incrémentation) selon le statut.
 - Réinitialisation de mot de passe : demande de code par email, validation du code, changement du mot de passe.
 - Middleware de sécurité : vérification du token JWT (`verifyToken.js`) et contrôle des rôles.

 ## Installation

 Pré-requis :

 - Node.js (>= 18 recommandé)
 - MongoDB (local ou Atlas)

 Étapes :

 1. Cloner le dépôt et se placer dans le dossier du projet.

 2. Installer les dépendances :

 ```bash
 npm install
 ```

 3. Créer un fichier `.env` à la racine avec les variables d'environnement suivantes (exemple) :

 ```
 PORT=5000
 MONGO_URI=mongodb://localhost:27017/nom_de_la_db
 JWT_SECRET=votre_cle_jwt
 EMAIL_USER=adresse@mail.com
 EMAIL_PASS=motdepasse_mail
 FRONT_URL=http://localhost:3000
 ```

 4. (Optionnel) Lancer le seeder pour pré-remplir la BD :

 ```bash
 node seeder.js
 ```

 ## Démarrage

 - En production :

 ```bash
 npm start
 ```

 - En développement (avec `nodemon` installé globalement ou en dépendance) :

 ```bash
 npx nodemon app.js
 ```

 Ou avec Docker Compose si vous avez fourni un `docker-compose.yml` :

 ```bash
 docker-compose up --build
 ```

 ## Scripts utiles

 - `npm start` : lance `node app.js`.

 Pour les autres scripts, consulter `package.json`.

 ## Variables d'environnement importantes

 - `MONGO_URI` : string de connexion à MongoDB.
 - `JWT_SECRET` : clé secrète pour signer les tokens JWT.
 - `EMAIL_USER` / `EMAIL_PASS` : pour envoyer les emails (nodemailer).
 - `FRONT_URL` : URL du front (utilisé pour les liens dans les emails).

 ## Routes principales (aperçu)

 Les routes sont regroupées dans le dossier `routes/`. Voici un aperçu des endpoints les plus utilisés. Préfixe global : `/api` pour la plupart des routes.

 - Auth / Utilisateurs
   - `POST /api/userRegister/register` : créer un compte (envoi d'un code de validation par mail).
   - `POST /api/userRegister/validate-code` : valider le code envoyé par email.
   - `POST /api/userLogin/login` : connexion (retourne token JWT).
   - `POST /api/userLogin/logout` : déconnexion.
   - `GET /api/user/profile` : récupérer la liste/profils (admin, filtrage possible par `role`, `nom`, `email`).
   - `PUT /api/userUpdate/:id` : modifier profil (auth requis).
   - `POST /api/userUpdate/validate-email` : valider un nouveau mail via code.
   - `PUT /api/userUpdate/change-status/:id` : changer le statut d'un utilisateur (admin).
   - `DELETE /api/user/delete/:id` : supprimer un utilisateur (admin).

 - Mot de passe
   - `POST /forgot-password` : demander un code de réinitialisation.
   - `POST /validate-code` : valider le code reçu.
   - `POST /reset-password` : réinitialiser le mot de passe.

 - Formations
   - `GET /api/formations` : lister les formations (filtres possibles : `titre`, `domaine`, `dateDebut`, etc.).
   - `GET /api/formations/:id` : récupérer une formation.
   - `POST /api/formations/addFormation` : ajouter une formation (admin).
   - `PUT /api/formations/updateFormation/:id` : modifier (admin).
   - `DELETE /api/formations/deleteFormation/:id` : supprimer (admin).

 - Réservations
   - `POST /api/reservations` : créer une réservation (employé). Body minimal : `{ "formation": "ID_FORMATION" }`.
   - `PUT /api/reservations/:id` : mettre à jour le statut d'une réservation (admin). Exemple : `{ "status": "confirmee" }`.
   - `GET /api/reservations` : récupérer toutes les réservations (admin, filtres : `employeId`, `formationId`).
   - `DELETE /api/reservations/public/:id` : supprimer une réservation (endpoint public avec contrôle optionnel par email).

  Remarque : les routes protégées requièrent le header `x-access-token: JWT_TOKEN`.

 ## Modèles de données (résumé)

 - `User` : nom, email, mot de passe (haché), role (`employe|admin`), `statut`, `emailVerified`, `competence[]`.
 - `Formation` : titre, domaine, description, `dateDebut`, `dateFin`, `minPlace`, `maxPlace`, `placeDispo`.
 - `Reservation` : référence vers `User` et `Formation`, `status` (`en_attente|confirmee|annulee`), date de réservation.

 ## Vue / Front

 Le dossier `views/` contient des pages EJS pour les flux d'email et de mot de passe :

 - `forgot-password.ejs`, `reset-password.ejs`, `sendPasswordMail.ejs`, `validate-code.ejs`.

 Ces vues sont utilisées pour afficher les formulaires et messages liés à la récupération de mot de passe et à la validation par code.

 ## Email

 La logique d'envoi d'email se trouve dans `utils/mailer.js` (configuration `nodemailer`). Les emails sont utilisés pour envoyer les codes de validation et les notifications de statut de réservation.

 ## Seeder

 Le fichier `seeder.js` permet de peupler la base de données avec des jeux de données de test. Exécutez `node seeder.js` après avoir configuré `.env` si vous voulez initialiser des données.

 ## Sécurité et bonnes pratiques

 - Les mots de passe sont hachés avec `bcrypt`.
 - Les routes protégées requièrent un token JWT signé avec `JWT_SECRET`.
 - Les opérations sensibles (création/modification/suppression de données critiques) doivent être restreintes au rôle `admin`.

 ## Débogage / développement

 - Vérifier les logs de `app.js` et la connexion MongoDB (`db.js`).
 - Utiliser `nodemon` pour recharger automatiquement en développement.

 ## Tests manuels rapides

 1. Créer un compte via `POST /api/userRegister/register`.
 2. Valider le code envoyé par email (checker la console ou l'email configuré).
 3. Se connecter avec `POST /api/userLogin/login`, récupérer le token.
 4. Créer une formation (compte admin) puis tester la réservation avec un compte employé.

 ## Prochaines améliorations possibles

 - Ajouter des tests automatisés (Jest / Mocha).
 - Ajouter un script `npm run dev` pour lancer `nodemon`.
 - Ajouter de la documentation OpenAPI / Swagger.

 ## Où regarder dans le code

 - Contrôleurs : `controllers/` (logique métier).
 - Routes : `routes/` (liste des endpoints).
 - Modèles Mongoose : `models/`.
 - Middleware : `middleware/verifyToken.js`.
 - Utilitaires mail : `utils/mailer.js`.

 ---

 Pour toute précision (exemples d'appels HTTP, schemas complets, ou traduction en anglais), dites-moi ce que vous voulez que j'ajoute ou clarifie.