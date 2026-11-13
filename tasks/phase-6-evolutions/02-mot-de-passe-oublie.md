# Tâche 6.2 — Mot de passe oublié

**Phase :** 6 — Évolutions
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md)
**Réfs cahier des charges :** §5.3

## Objectif

Implémenter le flux complet de réinitialisation de mot de passe par e-mail : demande de réinitialisation, envoi d'un lien à usage unique, formulaire de nouveau mot de passe.

## Contexte

Le lien « Mot de passe oublié ? » est déjà présent visuellement sur la page de connexion depuis la tâche 1.2 (§5.3 : « fonctionnalité optionnelle en phase 2 » — reportée ici en Phase 6 dans ce découpage). Nécessite l'introduction d'un service d'envoi d'e-mails, absent des dépendances des phases précédentes.

## Étapes détaillées

1. **Service d'envoi d'e-mails** — choisir un fournisseur (ex. SendGrid, Mailgun, ou SMTP via `nodemailer`) et l'intégrer (`services/emailService.js`), avec les identifiants en variables d'environnement (`.env`).

2. **Modèle de token de réinitialisation** — étendre `User` avec `resetPasswordToken` (String, haché) et `resetPasswordExpires` (Date), ou créer une collection dédiée `PasswordResetToken` avec `userId`, `tokenHash`, `expiresAt` — recommandé pour garder `User` allégé et permettre plusieurs demandes successives sans conflit.

3. **`POST /api/auth/forgot-password`**
   - Reçoit un `email`.
   - Si un compte existe, génère un token aléatoire sécurisé, le hache avant stockage (ne jamais stocker le token en clair, comme pour un mot de passe), l'associe à une expiration courte (ex. 1h).
   - Envoie un e-mail contenant un lien vers `CLIENT_URL/reinitialiser-mot-de-passe?token=...`.
   - **Réponse identique que l'email existe ou non** (« Si un compte existe avec cette adresse, un e-mail a été envoyé ») — même principe anti-énumération que le login (tâche 1.1, §5.3).

4. **`POST /api/auth/reset-password`**
   - Reçoit `token` + `newPassword` + `confirmNewPassword`.
   - Vérifie le token (haché, non expiré), hache le nouveau mot de passe, invalide le token après usage (usage unique).
   - Message d'erreur clair si le token est invalide/expiré.

5. **Frontend**
   - Page `/mot-de-passe-oublie` : formulaire e-mail, message de confirmation générique après soumission.
   - Page `/reinitialiser-mot-de-passe` (avec `?token=`) : formulaire nouveau mot de passe + confirmation, appel à `reset-password`, redirection vers `/connexion` avec message de succès.
   - Le lien « Mot de passe oublié ? » de la page de connexion (tâche 1.2) pointe désormais réellement vers `/mot-de-passe-oublie` au lieu de l'état « à venir ».

## Fichiers à créer / modifier

```
server/src/
├── models/User.js                       # ou nouveau modèle PasswordResetToken
├── services/emailService.js
├── controllers/authController.js        # ajout forgotPassword, resetPassword
└── routes/authRoutes.js                 # ajout des 2 routes

client/src/
├── pages/public/ForgotPassword.jsx
├── pages/public/ResetPassword.jsx
└── pages/public/Login.jsx               # lien mis à jour
```

## Modèles de données concernés

`User` (étendu) ou nouveau modèle `PasswordResetToken`.

## Règles métier / cas limites

- Token à usage unique, expiration courte, stocké haché (jamais en clair).
- Réponse identique que l'e-mail existe en base ou non (anti-énumération).
- Invalider tout token existant lors de la génération d'un nouveau (une seule demande active à la fois par utilisateur).
- Rate limiting sur `forgot-password` (évite le spam d'envoi d'e-mails / déni de service sur le service d'email).

## Critères d'acceptation

- [ ] Demander une réinitialisation pour un email existant et un email inexistant renvoient exactement la même réponse.
- [ ] Le lien reçu par e-mail permet de définir un nouveau mot de passe, utilisable ensuite pour se connecter.
- [ ] Un token expiré ou déjà utilisé est refusé avec message clair.
- [ ] Le rate limiting empêche l'abus de l'endpoint de demande.
