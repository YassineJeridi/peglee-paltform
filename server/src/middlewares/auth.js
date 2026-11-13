const { User } = require('../models');
const { verifyAccessToken } = require('../services/tokenService');
const ApiError = require('../utils/ApiError');

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token d\'authentification manquant.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Ne JAMAIS sélectionner passwordHash ici (§15) : req.user est accessible
    // par tous les contrôleurs authentifiés, donc plus la surface qui y a
    // accès est large, plus une future fuite accidentelle (ex. `res.json(req.user)`)
    // devient probable. Les rares endpoints qui ont réellement besoin du hash
    // (changePassword) le re-sélectionnent explicitement eux-mêmes.
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Utilisateur introuvable ou compte désactivé.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expirée, veuillez vous reconnecter.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Token invalide.'));
    }
    next(err);
  }
}

module.exports = auth;