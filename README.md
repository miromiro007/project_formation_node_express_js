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


---

## Formations

### Liste des formations
- **GET** `/api/formations`
- **Query** : `titre`, `domaine`, `dateDebut`, `dateFin`, `minPlace`, `maxPlace`
- **Réponse** : Liste des formations

### Récupérer une formation par ID
- **GET** `/api/formations/:id`
- **Réponse** : Objet formation correspondant à l’ID

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

Reservation API Documentation
This API provides endpoints for managing reservations for training sessions (formations). It includes functionality for employees to create reservations, admins to update reservation statuses, retrieve reservations, and delete reservations with optional email validation.
Table of Contents

Base URL
Authentication
Endpoints
Add a Reservation (Employee)
Update Reservation Status (Admin)
Get Reservations (Admin)
Delete a Reservation (Public)


Error Responses

Base URL
All endpoints are prefixed with /api/reservations.
Authentication
Most endpoints require a JSON Web Token (JWT) for authentication. Include the token in the request headers as follows:
x-access-token: YOUR_JWT_TOKEN


Employee Role: Required for creating reservations.
Admin Role: Required for updating reservation status and retrieving reservations.
Public Access: The delete endpoint does not require authentication but may require email validation.

Endpoints
Add a Reservation (Employee)
Create a new reservation for a training session.

Method: POST
Path: /api/reservations
Headers:x-access-token: JWT_TOKEN


Body:{
  "formation": "ID_FORMATION"
}


Description: Allows an employee to request a reservation for a specific training session. The formation ID must correspond to an existing training session, and there must be available slots (placeDispo > 0). The employee cannot reserve the same formation more than once.
Success Response:
Status: 201
Body:{
  "message": "Demande de réservation envoyée avec succès",
  "reservation": {
    "_id": "RESERVATION_ID",
    "formation": "ID_FORMATION",
    "employe": "EMPLOYEE_ID",
    "status": "en_attente",
    "dateReservation": "2025-09-29T14:18:00.000Z",
    "createdAt": "2025-09-29T14:18:00.000Z",
    "updatedAt": "2025-09-29T14:18:00.000Z"
  }
}





Update Reservation Status (Admin)
Update the status of an existing reservation.

Method: PUT
Path: /api/reservations/:id
Headers:x-access-token: JWT_TOKEN


Body:{
  "status": "confirmee|annulee|en_attente"
}


Description: Allows an admin to update the status of a reservation. If the status is set to confirmee, the available slots (placeDispo) for the formation are decremented. An email is sent to the employee to notify them of the status change.
Success Response:
Status: 200
Body:{
  "message": "Statut de la réservation mis à jour avec succès",
  "reservation": {
    "_id": "RESERVATION_ID",
    "formation": {
      "_id": "ID_FORMATION",
      "titre": "Formation Title",
      "placeDispo": 9
    },
    "employe": {
      "_id": "EMPLOYEE_ID",
      "nom": "Employee Name",
      "email": "employee@example.com"
    },
    "status": "confirmee",
    "dateReservation": "2025-09-29T14:18:00.000Z",
    "createdAt": "2025-09-29T14:18:00.000Z",
    "updatedAt": "2025-09-29T14:20:00.000Z"
  }
}





Get Reservations (Admin)
Retrieve all reservations, optionally filtered by employee or formation.

Method: GET
Path: /api/reservations
Headers:x-access-token: JWT_TOKEN


Query Parameters (optional):
employeId: Filter by employee ID.
formationId: Filter by formation ID.


Description: Allows an admin to retrieve a list of reservations, optionally filtered by employee or formation. The response includes populated employee and formation details (name, email, and title).
Success Response:
Status: 200
Body:[
  {
    "_id": "RESERVATION_ID",
    "formation": {
      "_id": "ID_FORMATION",
      "titre": "Formation Title"
    },
    "employe": {
      "_id": "EMPLOYEE_ID",
      "nom": "Employee Name",
      "email": "employee@example.com"
    },
    "status": "en_attente",
    "dateReservation": "2025-09-29T14:18:00.000Z",
    "createdAt": "2025-09-29T14:18:00.000Z",
    "updatedAt": "2025-09-29T14:18:00.000Z"
  }
]





Delete a Reservation (Public)
Delete a reservation with optional email validation.

Method: DELETE
Path: /api/reservations/public/:id
Body (optional):{
  "email": "employee@example.com"
}


Description: Deletes a reservation by its ID. If an email is provided, it must match the email of the employee associated with the reservation. If the reservation was confirmed, the available slots (placeDispo) for the formation are incremented.
Success Response:
Status: 200
Body:{
  "message": "Réservation supprimée avec succès"
}





Error Responses
Common error responses include:

400 Bad Request:{
  "message": "Error message (e.g., validation error or no available slots)"
}


401 Unauthorized:{
  "message": "Non autorisé"
}


403 Forbidden:{
  "message": "Email ne correspond pas à la réservation"
}


404 Not Found:{
  "message": "Réservation non trouvée"
}




---
## Utilisateurs

### Récupérer profils (admin)
- **GET** `/api/user/profile?role=...&nom=...&email=...`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Réponse** : Liste filtrée des utilisateurs


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

  ### Supprimer un utilisateur (admin)
- **DELETE** `/api/user/delete/:id`
- **Headers** : `x-access-token: JWT_TOKEN`
- **Paramètres URL** :  
  - `id` → Identifiant MongoDB de l’utilisateur à supprimer
- **Réponse (succès)** :
  ```json
  {
    "message": "L'utilisateur 652f1e8d9a23a9d4a8c1e5f0 a été supprimé avec succès"
  }

  Réponse (erreur - utilisateur introuvable) :
  {
  "message": "Utilisateur introuvable"
} 
Réponse (erreur - accès non autorisé) :

{
  "message": "Accès refusé, administrateur uniquement"
}
 
---

## Notes

- **Token JWT** : À envoyer dans le header `x-access-token` pour les routes protégées.
- **Format des dates** : ISO 8601 (`YYYY-MM-DD`).
- **Codes de validation** : 6 chiffres, valides pour une durée limitée.
- **Réponses d'erreur** : Toujours sous la forme `{ "message": "..." }`.

---

Pour toute question sur les endpoints, voir le code source ou demander à l'équipe back-end.


## Modèles de données

### Utilisateur (`User`)
```json
{
  "id": "string",
  "nom": "string",
  "email": "string",
  "role": "employe|admin",
  "competence": ["string"],
  "statut": "en_attente|actif|inactif",
  "emailVerified": true,
  "enLigne": true
}
```

### Formation (`Formation`)
```json
{
  "id": "string",
  "titre": "string",
  "domaine": "string",
  "description": "string",
  "dateDebut": "YYYY-MM-DD",
  "dateFin": "YYYY-MM-DD",
  "minPlace": 1,
  "maxPlace": 20
}
```

### Réservation (`Reservation`)
```json
{
  "id": "string",
  "user": "ID_USER",
  "formation": "ID_FORMATION",
  "status": "en_attente|confirmee|annulee",
  "dateReservation": "YYYY-MM-DD"
}

```

### Exemple de réponse d’erreur
```json
{
  "message": "Description de l’erreur"
}
```
ne peut pas reserver avec nbr de place  0 
```json
{ 
  message: "Plus de places disponibles pour cette formation" 
}





### l employé 