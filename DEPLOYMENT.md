# Déploiement en production

## Option A — Docker (recommandé)

```bash
cp server/.env.example .env     # ne garder que les variables ci-dessous
```

`.env` à la racine :

```
JWT_SECRET=<node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
CLIENT_URL=https://votre-domaine.tn
ADMIN_EMAIL=admin@votre-domaine.tn
ADMIN_PASSWORD=<mot de passe fort>
SMTP_HOST=smtp.exemple.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="Bac Informatique <no-reply@votre-domaine.tn>"
CODE_ENGINE=disabled          # ou piston (voir plus bas)
```

```bash
docker compose up -d --build
docker compose exec app node server/src/scripts/seed.js   # admin + contenu de démonstration + badges
```

L'application (API + frontend) écoute sur le port **5001**. Placez-la derrière un reverse proxy HTTPS (nginx, Caddy, Traefik) qui transmet `X-Forwarded-For` (`TRUST_PROXY=1` est déjà positionné). Exemple Caddy : `votre-domaine.tn { reverse_proxy localhost:5001 }`.

Au démarrage en production, le serveur **refuse de démarrer** si : `JWT_SECRET` < 32 caractères ou valeur d'exemple, `SMTP_HOST` absent, ou `CODE_ENGINE=local`.

## Option B — Sans Docker

```bash
cd client && npm ci && npm run build && cd ..
cd server && npm ci --omit=dev
NODE_ENV=production SERVE_CLIENT=true PORT=5001 node src/server.js   # ou via pm2
```

Variables : voir [server/.env.example](server/.env.example). MongoDB 6+ requis.

## Exécution de code Python

- `CODE_ENGINE=disabled` : le bouton « Exécuter » renvoie une erreur 503 ; la validation manuelle reste possible.
- `CODE_ENGINE=piston` : sandbox [Piston](https://github.com/engineer-man/piston) (isolation processus, pas de réseau, limites CPU/mémoire). Démarrer avec `docker compose --profile code up -d`, puis installer Python une fois :
  `curl -X POST localhost:2000/api/v2/packages -d '{"language":"python","version":"*"}'` (depuis le conteneur `app`, hôte `piston`).
  Piston nécessite `privileged: true` : à isoler sur un hôte dédié si possible.
- `CODE_ENGINE=local` : **développement uniquement** (sous-processus Python avec limites de temps/ressources, mais **sans isolation réseau ni système de fichiers**). Bloqué en production.

## Check-list avant mise en ligne

- [ ] HTTPS actif (le JWT circule dans l'en-tête `Authorization`).
- [ ] `JWT_SECRET`, `ADMIN_PASSWORD` forts et propres à la production.
- [ ] Mot de passe admin changé après la première connexion.
- [ ] Sauvegardes MongoDB planifiées (`mongodump`) + sauvegarde du volume `uploads`.
- [ ] SMTP testé (« Mot de passe oublié » reçoit bien l'e-mail).
- [ ] Contenu réel saisi/importé (Admin → Import) et décisions client validées (`tasks/points-a-confirmer.md`).
- [ ] Vérification manuelle responsive sur vrais appareils (tâche 5.2).
