const fs = require('fs/promises');
const path = require('path');
const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { detectImageSignature } = require('../utils/fileSignature');
const ApiError = require('../utils/ApiError');

const AVATARS_DIR = path.resolve(__dirname, '../../uploads/avatars');

function toUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    xp: user.xp,
    level: user.level,
  };
}

async function updateMe(req, res, next) {
  try {
    const { username, email } = req.body;
    const updates = {};

    if (username !== undefined) {
      // Exclure le document courant de la recherche de doublon (§6.6) — sinon
      // l'élève ne pourrait jamais re-soumettre son propre formulaire.
      const existing = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existing) {
        throw new ApiError(409, "Ce nom d'utilisateur est déjà pris.", [
          { field: 'username', message: "Ce nom d'utilisateur est déjà pris." },
        ]);
      }
      updates.username = username;
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
      if (existing) {
        throw new ApiError(409, 'Cet e-mail est déjà utilisé.', [
          { field: 'email', message: 'Cet e-mail est déjà utilisé.' },
        ]);
      }
      updates.email = normalizedEmail;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      throw new ApiError(400, 'Tous les champs sont requis.');
    }
    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, 'Les mots de passe ne correspondent pas.', [
        { field: 'confirmNewPassword', message: 'Les mots de passe ne correspondent pas.' },
      ]);
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, 'Le nouveau mot de passe doit contenir au moins 8 caractères.', [
        { field: 'newPassword', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' },
      ]);
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Mot de passe actuel incorrect.', [
        { field: 'currentPassword', message: 'Mot de passe actuel incorrect.' },
      ]);
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    next(err);
  }
}

async function uploadAvatarHandler(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Aucun fichier reçu.');
    }

    // Ne jamais faire confiance au Content-Type déclaré par le client seul
    // (§15) : on vérifie la signature binaire réelle avant d'écrire quoi que
    // ce soit sur le disque.
    const signature = detectImageSignature(req.file.buffer);
    if (!signature) {
      throw new ApiError(400, 'Le fichier doit être une image JPG, PNG ou WEBP valide.');
    }

    const user = await User.findById(req.user.id);

    // Nom de fichier généré, jamais le nom original envoyé par l'élève (§15).
    const filename = `${user._id}-${Date.now()}${signature.ext}`;
    await fs.writeFile(path.join(AVATARS_DIR, filename), req.file.buffer);

    // Supprime l'ancien avatar local s'il y en a un (jamais une URL externe,
    // pour rester compatible avec une future migration Cloudinary,
    // points-a-confirmer.md #6).
    if (user.profilePicture && user.profilePicture.startsWith('/uploads/avatars/')) {
      const oldPath = path.resolve(__dirname, '../..', user.profilePicture.replace(/^\//, ''));
      fs.unlink(oldPath).catch(() => {});
    }

    user.profilePicture = `/uploads/avatars/${filename}`;
    await user.save();

    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateMe, changePassword, uploadAvatarHandler };
