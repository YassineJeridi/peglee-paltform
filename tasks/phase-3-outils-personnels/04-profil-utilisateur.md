# Tâche 3.4 — Profil utilisateur (`/app/profil`)

**Phase :** 3 — Outils personnels
**Dépendances :** [phase-1-auth-layout/01-api-authentification.md](../phase-1-auth-layout/01-api-authentification.md)
**Réfs cahier des charges :** §6.6, §9.2 (multer), §10.1, §11.2, §15, points-a-confirmer.md #6

## Objectif

Permettre à l'élève de modifier sa photo de profil, son nom d'utilisateur, son e-mail et son mot de passe, avec les validations et confirmations attendues.

## Contexte

Le §6.6 exige : validation des champs (email valide, mot de passe fort, unicité e-mail/username), confirmation visuelle après enregistrement. Le stockage des photos (local vs Cloudinary) est un point ouvert (voir [points-a-confirmer.md](../points-a-confirmer.md) #6) — ce document part sur un stockage local via `multer` pour le MVP, en gardant le contrat d'API (`profilePicture` = URL) compatible avec une migration future vers un service externe.

## Étapes détaillées — Backend

1. **`GET /api/users/me`** 🔒 — déjà couvert fonctionnellement par `GET /api/auth/me` (tâche 1.1) ; si un endpoint distinct est préféré pour séparer les responsabilités « auth » et « profil », le créer ici en réutilisant la même logique.
2. **`PUT /api/users/me`** 🔒 — modification `username`/`email` :
   - Valider unicité (exclure le document courant de la recherche de doublon).
   - Messages d'erreur clairs en français.
3. **`PUT /api/users/me/password`** 🔒 — changement de mot de passe :
   - Exiger `currentPassword`, `newPassword`, `confirmNewPassword` dans le body (§6.6 « avec saisie du mot de passe actuel + nouveau + confirmation »).
   - Vérifier `currentPassword` par `bcrypt.compare` avant d'accepter le changement.
   - Valider la force du nouveau mot de passe (même règle que l'inscription, min 8 caractères — durcissable ici si le client le souhaite).
   - Hacher et sauvegarder le nouveau mot de passe.
4. **`POST /api/users/me/avatar`** 🔒 — upload de la photo de profil :
   - Middleware `multer` configuré avec limite de taille (ex. 2-5 Mo) et filtre de types autorisés (`jpg`, `png`, `webp` — §15).
   - Nom de fichier assaini (généré, ex. `userId + timestamp + extension`, jamais le nom original du fichier utilisateur tel quel — §15).
   - Stocke le fichier dans `server/uploads/avatars/`, sert ce dossier en statique (`express.static`) ou via un endpoint dédié.
   - Met à jour `User.profilePicture` avec le chemin/URL.
   - Supprimer l'ancien fichier avatar lors du remplacement (éviter l'accumulation de fichiers orphelins).

## Étapes détaillées — Frontend

1. **Service API** (`api/profileApi.js`) : `updateProfile()`, `changePassword()`, `uploadAvatar()`.
2. **Page `Profil.jsx`** (`pages/student/Profil.jsx`, route `/app/profil`)
   - Section photo : avatar actuel, bouton de remplacement avec **aperçu avant envoi** (§6.6), appel à l'upload.
   - Section informations : formulaire `username`/`email` avec validation (react-hook-form + zod).
   - Section mot de passe : formulaire séparé (mot de passe actuel + nouveau + confirmation).
   - **Confirmation visuelle** après chaque enregistrement réussi (snackbar, §6.6/§12.4).
   - Après changement d'email/username réussi, mettre à jour l'état `AuthContext` (tâche 1.3) pour que la barre supérieure/sidebar reflètent immédiatement le changement.

## Fichiers à créer / modifier

```
server/src/
├── controllers/userController.js       # ajout des méthodes profil (updateMe, changePassword, uploadAvatar)
├── routes/userRoutes.js
└── middlewares/uploadAvatar.js          # config multer dédiée

client/src/
├── api/profileApi.js
└── pages/student/Profil.jsx
```

## Modèles de données concernés

`User` (§10.1, champs `username`, `email`, `passwordHash`, `profilePicture`).

## Endpoints API concernés

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/users/me` 🔒 | Profil courant. |
| PUT | `/api/users/me` 🔒 | Modifier username / e-mail. |
| PUT | `/api/users/me/password` 🔒 | Changer le mot de passe. |
| POST | `/api/users/me/avatar` 🔒 | Upload photo de profil. |

## Règles métier / cas limites

- Le changement de mot de passe échoue si `currentPassword` est incorrect, avec message dédié.
- L'unicité de `username`/`email` doit exclure l'utilisateur courant de la vérification (sinon il ne pourrait jamais re-soumettre son propre formulaire sans changer ces champs).
- Upload : rejeter tout fichier hors `jpg/png/webp` ou dépassant la taille limite, avec message clair, **avant** d'écrire quoi que ce soit sur le disque.
- Ne jamais faire confiance au `Content-Type` déclaré par le client seul — valider aussi l'extension/le contenu réel si possible.

## Critères d'acceptation

- [ ] Modifier username/email avec des données valides fonctionne et se reflète immédiatement dans l'interface (sidebar, menu profil).
- [ ] Tenter de prendre un username/email déjà utilisé par un autre compte échoue avec message clair.
- [ ] Changer le mot de passe avec un mauvais mot de passe actuel échoue.
- [ ] Changer le mot de passe avec des données valides permet de se reconnecter avec le nouveau mot de passe.
- [ ] Uploader une image valide met à jour l'avatar affiché ; uploader un fichier non autorisé (ex. `.exe` ou trop volumineux) est rejeté avec message clair.
