const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { User, SubModule, Progress, Task, Note, Event, QuizAttempt } = require('../models');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const { getStudentOverview } = require('../services/progressService');

const PAGE_SIZE_DEFAULT = 25;
const PAGE_SIZE_MAX = 100;
const SORTABLE_FIELDS = ['username', 'email', 'role', 'createdAt', 'isActive'];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toUserSummary(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

async function listUsers(req, res, next) {
  try {
    const {
      search,
      role: roleFilter,
      isActive,
      page = 1,
      pageSize = PAGE_SIZE_DEFAULT,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (search) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ username: regex }, { email: regex }];
    }
    if (roleFilter) filter.role = roleFilter;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const pageNum = Math.max(Number(page) || 1, 1);
    const size = Math.min(Math.max(Number(pageSize) || PAGE_SIZE_DEFAULT, 1), PAGE_SIZE_MAX);
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const [users, total, totalSubModules] = await Promise.all([
      User.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((pageNum - 1) * size)
        .limit(size),
      User.countDocuments(filter),
      SubModule.countDocuments(),
    ]);

    // Progression synthétique (réutilise la même logique que tâche 2.1) —
    // calculée uniquement pour les élèves de CETTE page, pas toute la base.
    const studentIds = users.filter((u) => u.role === 'student').map((u) => u._id);
    let completedByUser = new Map();
    if (studentIds.length > 0 && totalSubModules > 0) {
      const rows = await Progress.aggregate([
        { $match: { userId: { $in: studentIds }, status: 'completed' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]);
      completedByUser = new Map(rows.map((r) => [r._id.toString(), r.count]));
    }

    const items = users.map((u) => {
      const completed = completedByUser.get(u._id.toString()) || 0;
      const progressPercent =
        u.role === 'student' && totalSubModules > 0 ? Math.round((completed / totalSubModules) * 100) : null;
      return { ...toUserSummary(u), progressPercent };
    });

    res.json({ items, total, page: pageNum, pageSize: size });
  } catch (err) {
    next(err);
  }
}

async function getUserDetail(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant utilisateur invalide.');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'Utilisateur introuvable.');
    }

    const progress = user.role === 'student' ? await getStudentOverview(user._id) : null;

    res.json({
      ...toUserSummary(user),
      xp: user.xp,
      level: user.level,
      progress,
    });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { username, email, password, role: newRole, isActive } = req.body;

    if (!username || !email || !password) {
      throw new ApiError(400, "Nom d'utilisateur, e-mail et mot de passe sont requis.");
    }

    const normalizedEmail = email.toLowerCase();
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username }),
    ]);
    if (existingEmail) {
      throw new ApiError(409, 'Cet e-mail est déjà utilisé.', [
        { field: 'email', message: 'Cet e-mail est déjà utilisé.' },
      ]);
    }
    if (existingUsername) {
      throw new ApiError(409, "Ce nom d'utilisateur est déjà pris.", [
        { field: 'username', message: "Ce nom d'utilisateur est déjà pris." },
      ]);
    }

    const passwordHash = await hashPassword(password);
    // Seul point d'entrée légitime pour créer un compte `admin` en dehors du
    // seed (§3.2) — aucune interface publique ne permet l'auto-promotion.
    const user = await User.create({
      username,
      email: normalizedEmail,
      passwordHash,
      role: newRole === 'admin' ? 'admin' : 'student',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(toUserSummary(user));
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant utilisateur invalide.');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'Utilisateur introuvable.');
    }

    const { username, email, role: newRole, isActive } = req.body;

    if (username !== undefined && username !== user.username) {
      const existing = await User.findOne({ username, _id: { $ne: id } });
      if (existing) {
        throw new ApiError(409, "Ce nom d'utilisateur est déjà pris.", [
          { field: 'username', message: "Ce nom d'utilisateur est déjà pris." },
        ]);
      }
      user.username = username;
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase();
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
        if (existing) {
          throw new ApiError(409, 'Cet e-mail est déjà utilisé.', [
            { field: 'email', message: 'Cet e-mail est déjà utilisé.' },
          ]);
        }
        user.email = normalizedEmail;
      }
    }

    // Garde-fou (non explicitement demandé par le cahier des charges, mais
    // évite un verrouillage total de la plateforme) : un admin ne peut pas se
    // rétrograder/désactiver lui-même s'il est le dernier admin restant.
    const isSelf = req.user.id === id;
    const isSelfDowngrade = isSelf && ((newRole !== undefined && newRole !== 'admin') || isActive === false);
    if (isSelfDowngrade && user.role === 'admin') {
      const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: id } });
      if (otherAdmins === 0) {
        throw new ApiError(400, 'Impossible : vous êtes le seul administrateur restant.');
      }
    }

    if (newRole !== undefined) user.role = newRole === 'admin' ? 'admin' : 'student';
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    res.json(toUserSummary(user));
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant utilisateur invalide.');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'Utilisateur introuvable.');
    }

    // Suppression en cascade des données personnelles associées (§15) pour
    // éviter des documents orphelins référençant un userId inexistant.
    await Promise.all([
      Progress.deleteMany({ userId: id }),
      Task.deleteMany({ userId: id }),
      Note.deleteMany({ userId: id }),
      Event.deleteMany({ userId: id }),
      QuizAttempt.deleteMany({ userId: id }),
    ]);

    if (user.profilePicture && user.profilePicture.startsWith('/uploads/avatars/')) {
      const avatarPath = path.resolve(__dirname, '../..', user.profilePicture.replace(/^\//, ''));
      fs.unlink(avatarPath).catch(() => {});
    }

    await user.deleteOne();

    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    next(err);
  }
}

function generateTempPassword() {
  return crypto.randomBytes(9).toString('base64').replace(/[/+=]/g, '').slice(0, 12);
}

async function resetPassword(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant utilisateur invalide.');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'Utilisateur introuvable.');
    }

    const temporaryPassword = generateTempPassword();
    user.passwordHash = await hashPassword(temporaryPassword);
    await user.save();

    // Pas de système d'e-mail en V1 (§2.3) : le mot de passe temporaire n'est
    // renvoyé qu'une seule fois ici, à charge de l'admin de le transmettre
    // manuellement à l'élève.
    res.json({ temporaryPassword });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, getUserDetail, createUser, updateUser, deleteUser, resetPassword };
