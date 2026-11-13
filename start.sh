#!/usr/bin/env bash
# Lance l'intégralité de la plateforme (API + frontend) en une seule commande :
# installe les dépendances manquantes, vérifie la config et MongoDB, puis
# démarre le serveur et le client en parallèle.
#
# Usage :
#   ./start.sh            # lance l'API + le frontend
#   ./start.sh --seed     # lance en plus le seed (admin + données de démo) avant de démarrer
#   ./start.sh --reset    # reseed complet (vide la base) avant de démarrer

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"

DO_SEED=false
DO_RESET=false
for arg in "$@"; do
  case "$arg" in
    --seed) DO_SEED=true ;;
    --reset) DO_RESET=true ;;
    *)
      echo "Option inconnue : $arg (usage: ./start.sh [--seed|--reset])"
      exit 1
      ;;
  esac
done

info() { printf '\033[1;34m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m!!\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31mERREUR\033[0m %s\n' "$1"; exit 1; }

command -v node >/dev/null 2>&1 || fail "Node.js est requis mais introuvable dans le PATH."
command -v npm  >/dev/null 2>&1 || fail "npm est requis mais introuvable dans le PATH."

# --- Dépendances -----------------------------------------------------------

if [ ! -d "$SERVER_DIR/node_modules" ]; then
  info "Installation des dépendances serveur..."
  (cd "$SERVER_DIR" && npm install) || fail "npm install a échoué dans server/."
fi

if [ ! -d "$CLIENT_DIR/node_modules" ]; then
  info "Installation des dépendances client..."
  (cd "$CLIENT_DIR" && npm install) || fail "npm install a échoué dans client/."
fi

# --- Fichiers .env -----------------------------------------------------------

if [ ! -f "$SERVER_DIR/.env" ]; then
  warn "server/.env introuvable, copie depuis server/.env.example."
  cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
  warn "Vérifiez/renseignez les valeurs dans server/.env avant utilisation réelle."
fi

if [ ! -f "$CLIENT_DIR/.env" ]; then
  warn "client/.env introuvable, copie depuis client/.env.example."
  cp "$CLIENT_DIR/.env.example" "$CLIENT_DIR/.env"
fi

# --- MongoDB -----------------------------------------------------------------

MONGO_URI="$(grep -E '^MONGODB_URI=' "$SERVER_DIR/.env" | cut -d '=' -f2-)"

if [[ "$MONGO_URI" == *"localhost"* || "$MONGO_URI" == *"127.0.0.1"* ]]; then
  MONGO_PORT="$(echo "$MONGO_URI" | sed -E 's#.*:([0-9]+)/.*#\1#')"
  MONGO_PORT="${MONGO_PORT:-27017}"

  if ! (exec 3<>"/dev/tcp/127.0.0.1/$MONGO_PORT") 2>/dev/null; then
    fail "MongoDB n'est pas accessible sur 127.0.0.1:$MONGO_PORT. Démarrez-le d'abord, par ex. :
    brew services start mongodb-community   (macOS/Homebrew)
    ou : mongod --dbpath <votre-dossier-de-données>"
  fi
  exec 3<&- 3>&- 2>/dev/null || true
  info "MongoDB détecté sur 127.0.0.1:$MONGO_PORT."
else
  info "MONGODB_URI ne pointe pas vers localhost, vérification de connectivité ignorée."
fi

# --- Seed optionnel ------------------------------------------------------------

if [ "$DO_RESET" = true ]; then
  info "Reseed complet de la base (server/npm run seed:reset)..."
  (cd "$SERVER_DIR" && npm run seed:reset) || fail "Le reset/seed a échoué."
elif [ "$DO_SEED" = true ]; then
  info "Seed de la base (server/npm run seed)..."
  (cd "$SERVER_DIR" && npm run seed) || fail "Le seed a échoué."
fi

# --- Lancement des deux services ---------------------------------------------

PIDS=()

# `npm run dev` lance nodemon/vite comme processus enfants distincts : tuer
# uniquement le PID de `npm` les laisse orphelins en arrière-plan. On
# descend donc l'arbre des processus via `pgrep -P` pour tout signaler,
# des feuilles vers la racine.
kill_tree() {
  local pid="$1" sig="$2" child
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child" "$sig"
  done
  kill -"$sig" "$pid" 2>/dev/null || true
}

cleanup() {
  echo ""
  info "Arrêt des services..."
  for pid in "${PIDS[@]:-}"; do
    kill_tree "$pid" TERM
  done
  sleep 1
  for pid in "${PIDS[@]:-}"; do
    kill_tree "$pid" KILL
  done
  exit 0
}
trap cleanup INT TERM

info "Démarrage de l'API sur http://localhost:5001 ..."
(cd "$SERVER_DIR" && npm run dev) &
PIDS+=("$!")

sleep 1

info "Démarrage du frontend sur http://localhost:5183 ..."
(cd "$CLIENT_DIR" && npm run dev) &
PIDS+=("$!")

echo ""
info "Plateforme lancée. Ctrl+C pour tout arrêter."
wait
