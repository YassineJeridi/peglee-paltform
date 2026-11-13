// Stockage du JWT (stratégie Bearer, cf. README « Authentification »).
// Centralisé ici pour que l'intercepteur Axios et l'AuthContext partagent
// la même clé et la même source de vérité.

const TOKEN_KEY = 'bi_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage indisponible (mode privé strict) : on ignore silencieusement */
  }
}

export function clearToken() {
  setToken(null);
}
