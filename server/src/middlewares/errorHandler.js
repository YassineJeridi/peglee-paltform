const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Erreur serveur inattendue.';
  let errors = err.errors;

  // Erreurs Mongoose : validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Données invalides.';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Erreurs Mongoose : cast (ex. ObjectId malformé)
  if (err.name === 'CastError') {
    status = 400;
    message = `Identifiant invalide : ${err.value}`;
  }

  // Erreurs Multer (upload de fichier, ex. taille dépassée)
  if (err.name === 'MulterError') {
    status = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Le fichier dépasse la taille maximale autorisée (5 Mo).'
        : "Erreur lors de l'envoi du fichier.";
  }

  // Violation d'index unique
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `La valeur du champ « ${field} » existe déjà.` : 'Valeur en doublon.';
  }

  // Erreurs serveur inattendues : log complet côté serveur uniquement
  if (status >= 500) {
    console.error('[error]', err);
    if (env.isProduction) {
      message = 'Erreur serveur inattendue.';
      errors = undefined;
    }
  }

  const payload = { message };
  if (errors) payload.errors = errors;

  res.status(status).json(payload);
}

module.exports = errorHandler;
