// Traduit une erreur Axios en (1) messages par champ posés sur react-hook-form
// et (2) un message global à afficher en bandeau. Les champs inconnus du
// formulaire retombent sur le message global.

export function extractServerErrors(error, { setError, knownFields = [] } = {}) {
  const data = error?.response?.data;

  // Pas de réponse serveur : erreur réseau.
  if (!error?.response) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
  }

  const fieldErrors = Array.isArray(data?.errors) ? data.errors : [];
  let handledGlobally = null;

  if (setError && fieldErrors.length) {
    for (const fe of fieldErrors) {
      if (fe.field && knownFields.includes(fe.field)) {
        setError(fe.field, { type: 'server', message: fe.message });
      } else {
        handledGlobally = fe.message;
      }
    }
  }

  // Message global : priorité au message serveur, sinon un champ non mappé,
  // sinon un fallback générique.
  return data?.message || handledGlobally || 'Une erreur est survenue.';
}
