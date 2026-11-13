const crypto = require('crypto');
const { User, PasswordResetToken } = require('../models');
const env = require('../config/env');
const { sendPasswordResetEmail } = require('../services/emailService');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken } = require('../services/tokenService');
const ApiError = require('../utils/ApiError');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ApiError(409, 'Cet e-mail est déjà utilisé.', [
        { field: 'email', message: 'Cet e-mail est déjà utilisé.' },
      ]);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new ApiError(409, 'Ce nom d\'utilisateur est déjà pris.', [
        { field: 'username', message: 'Ce nom d\'utilisateur est déjà pris.' },
      ]);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      role: 'student',
      isActive: true,
    });

    const token = generateAccessToken(user);

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      xp: user.xp,
      level: user.level,
    };

    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new ApiError(401, 'E-mail ou mot de passe incorrect.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Votre compte a été désactivé. Contactez l\'administration.');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'E-mail ou mot de passe incorrect.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateAccessToken(user);

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      xp: user.xp,
      level: user.level,
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.json({ message: 'Déconnexion réussie.' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = req.user;

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      xp: user.xp,
      level: user.level,
      lastLoginAt: user.lastLoginAt,
    };

    res.json(userResponse);
  } catch (err) {
    next(err);
  }
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Réponse strictement identique que le compte existe ou non (anti-énumération).
async function forgotPassword(req, res, next) {
  const genericResponse = {
    message: "Si un compte existe avec cette adresse, un e-mail a été envoyé.",
  };
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (user && user.isActive) {
      // Une seule demande active par utilisateur.
      await PasswordResetToken.deleteMany({ userId: user._id });

      const token = crypto.randomBytes(32).toString('hex');
      await PasswordResetToken.create({
        userId: user._id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      });

      const resetUrl = `${env.clientUrl}/reinitialiser-mot-de-passe?token=${token}`;
      // L'échec d'envoi ne doit pas révéler l'existence du compte : on le journalise seulement.
      sendPasswordResetEmail(user.email, user.username, resetUrl).catch((err) =>
        console.error('[email] Échec envoi réinitialisation :', err.message)
      );
    }

    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    // Suppression atomique : garantit l'usage unique même en cas de requêtes concurrentes.
    const record = await PasswordResetToken.findOneAndDelete({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      throw new ApiError(400, 'Ce lien de réinitialisation est invalide ou a expiré.');
    }

    const user = await User.findById(record.userId).select('+passwordHash');
    if (!user || !user.isActive) {
      throw new ApiError(400, 'Ce lien de réinitialisation est invalide ou a expiré.');
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    await PasswordResetToken.deleteMany({ userId: user._id });

    res.json({ message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, forgotPassword, resetPassword };