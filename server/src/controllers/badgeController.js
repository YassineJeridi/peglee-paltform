const mongoose = require('mongoose');
const { Badge, UserBadge } = require('../models');
const ApiError = require('../utils/ApiError');

function pickBadgeFields(body) {
  const { title, description, icon, criteria, isActive } = body;
  const out = {};
  if (title !== undefined) out.title = title;
  if (description !== undefined) out.description = description;
  if (icon !== undefined) out.icon = icon;
  if (isActive !== undefined) out.isActive = Boolean(isActive);
  if (criteria !== undefined) {
    if (!criteria || !Badge.CRITERIA_TYPES.includes(criteria.type)) {
      throw new ApiError(400, "Type de critère invalide.");
    }
    if (criteria.type === 'module_completed' && !criteria.moduleSlug) {
      throw new ApiError(400, 'Le module cible est requis pour ce critère.');
    }
    out.criteria = {
      type: criteria.type,
      value: Math.max(1, Number(criteria.value) || 1),
      moduleSlug: criteria.type === 'module_completed' ? String(criteria.moduleSlug) : '',
    };
  }
  return out;
}

// Catalogue complet + date d'obtention : permet d'afficher les badges « à débloquer » en grisé.
async function getMyBadges(req, res, next) {
  try {
    const [badges, owned] = await Promise.all([
      Badge.find({ isActive: true }).sort({ createdAt: 1 }),
      UserBadge.find({ userId: req.user.id }),
    ]);
    const earnedAt = new Map(owned.map((o) => [o.badgeId.toString(), o.earnedAt]));
    res.json(
      badges.map((b) => ({
        _id: b._id,
        title: b.title,
        description: b.description,
        icon: b.icon,
        earned: earnedAt.has(b._id.toString()),
        earnedAt: earnedAt.get(b._id.toString()) || null,
      }))
    );
  } catch (err) {
    next(err);
  }
}

async function listBadgesForAdmin(req, res, next) {
  try {
    res.json(await Badge.find().sort({ createdAt: 1 }));
  } catch (err) {
    next(err);
  }
}

async function createBadge(req, res, next) {
  try {
    if (!req.body.title) throw new ApiError(400, 'Le titre est requis.');
    if (!req.body.criteria) throw new ApiError(400, 'Le critère est requis.');
    res.status(201).json(await Badge.create(pickBadgeFields(req.body)));
  } catch (err) {
    next(err);
  }
}

async function updateBadge(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide.');
    const badge = await Badge.findById(id);
    if (!badge) throw new ApiError(404, 'Badge introuvable.');
    badge.set(pickBadgeFields(req.body));
    await badge.save();
    res.json(badge);
  } catch (err) {
    next(err);
  }
}

async function deleteBadge(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide.');
    const badge = await Badge.findById(id);
    if (!badge) throw new ApiError(404, 'Badge introuvable.');
    await badge.deleteOne();
    await UserBadge.deleteMany({ badgeId: id });
    res.json({ message: 'Badge supprimé.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyBadges, listBadgesForAdmin, createBadge, updateBadge, deleteBadge };
