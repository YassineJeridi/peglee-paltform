const ApiError = require('../utils/ApiError');

function role(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentification requise.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Accès refusé : rôle insuffisant.'));
    }
    next();
  };
}

module.exports = role;