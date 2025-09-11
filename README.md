# API Formation – Documentation pour le Front-End

## Authentification

### Connexion
- **POST** `/api/userLogin/login`
- **Body** :
  ```json
  {
    "email": "user@email.com",
    "password": "motdepasse"
  }
  ```
- **Réponse** :
  ```json
  {
    "message": "Connexion réussie",
    "token": "JWT_TOKEN",
    "user": {
      "id": "...",
      "nom": "...",
      "email": "...",
      "role": "employe|admin",
      "statut": "en_attente|actif|inactif",
      "enLigne": true
    }
  }
  ```

### Déconnexion
- **POST** `/api/userLogin/logout`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Réponse** :
  ```json
  {
    "message": "Déconnexion réussie",
    "user": { ... }
  }
  ```

---

## Inscription

### Enregistrement
- **POST** `/api/userRegister/register`
- **Body** :
  ```json
  {
    "nom": "Nom complet",
    "email": "user@email.com",
    "password": "motdepasse",
    "role": "employe" // ou "admin"
  }
  ```
- **Réponse** :
  ```json
  {
    "message": "Compte créé avec succès. En attente d'activation par le admin.",
    "user": { ... }
  }
  ```

### Validation du code d'inscription
- **POST** `/api/userRegister/validate-code`
- **Body** :
  ```json
  {
    "email": "user@email.com",
    "code": "123456"
  }
  ```
- **Réponse** :
  ```json
  {
    "message": "Email vérifié avec succès. Votre compte est en attente d'approbation par un responsable admin."
  }
  ```

---

## Mot de passe oublié

### Demander un code
- **POST** `/forgot-password`
- **Body** :
  ```json
  {
    "email": "user@email.com"
  }
  ```
- **Réponse** : Affiche un message dans la vue

### Valider le code
- **POST** `/validate-code`
- **Body** :
  ```json
  {
    "email": "user@email.com",
    "code": "123456"
  }
  ```
- **Réponse** : Redirige vers la page de réinitialisation

### Réinitialiser le mot de passe
- **POST** `/reset-password`
- **Body** :
  ```json
  {
    "email": "user@email.com",
    "code": "123456",
    "password": "nouveaumotdepasse",
    "confirmPassword": "nouveaumotdepasse"
  }
  ```
- **Réponse** : Affiche succès ou erreur

---

## Utilisateurs

### Récupérer profils (admin)
- **GET** `/api/user/profile?role=...&nom=...&email=...`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Réponse** : Liste filtrée des utilisateurs

---

## Formations

### Liste des formations
- **GET** `/api/formations`
- **Query** : `titre`, `domaine`, `dateDebut`, `dateFin`, `minPlace`, `maxPlace`
- **Réponse** : Liste des formations

### Ajouter une formation (admin)
- **POST** `/api/formations/addFormation`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Body** : Voir modèle formation

### Modifier une formation (admin)
- **PUT** `/api/formations/updateFormation/:id`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Body** : Champs à modifier

### Supprimer une formation (admin)
- **DELETE** `/api/formations/deleteFormation/:id`
- **Headers** : `x-access-token: JWT_TOKEN`

---

## Réservations

### Ajouter une réservation (employé)
- **POST** `/api/reservations`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Body** :
  ```json
  {
    "formation": "ID_FORMATION"
  }
  ```

### Modifier le statut (admin)
- **PUT** `/api/reservations/:id`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Body** :
  ```json
  {
    "status": "confirmee|annulee|en_attente"
  }
  ```

---

## Mise à jour utilisateur

### Modifier profil
- **PUT** `/api/userUpdate/:id`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Body** : Champs à modifier

### Valider changement d'email
- **POST** `/api/userUpdate/validate-email`
- **Body** :
  ```json
  {
    "email": "nouvel@email.com",
    "code": "123456"
  }
  ```

### Changer statut (admin)
- **PUT** `/api/userUpdate/change-status/:id`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Body** :
  ```json
  {
    "statut": "actif|inactif"
  }
  ```

---

## Notes

- **Token JWT** : À envoyer dans le header `x-access-token` pour les routes protégées.
- **Format des dates** : ISO 8601 (`YYYY-MM-DD`).
- **Codes de validation** : 6 chiffres, valides pour une durée limitée.
- **Réponses d'erreur** : Toujours sous la forme `{ "message": "..." }`.

---

Pour toute question sur les endpoints, voir le code source ou demander à l'équipe back-end.
