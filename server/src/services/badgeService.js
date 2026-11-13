const { Badge, UserBadge, Progress, Module, SubModule, User } = require('../models');
const { notify } = require('./notificationService');

async function computeStats(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const progresses = await Progress.find({ userId });
  return {
    user,
    lessons_completed: progresses.filter((p) => p.lessonCompleted).length,
    quizzes_passed: progresses.filter((p) => p.quizPassed).length,
    exercises_completed: progresses.reduce((n, p) => n + p.exercisesCompleted.length, 0),
    submodules_completed: progresses.filter((p) => p.status === 'completed').length,
    completedSubModuleIds: new Set(
      progresses.filter((p) => p.status === 'completed').map((p) => p.subModuleId.toString())
    ),
  };
}

async function isModuleCompleted(moduleSlug, completedSubModuleIds) {
  const moduleDoc = await Module.findOne({ slug: moduleSlug });
  if (!moduleDoc) return false;
  const subs = await SubModule.find({ moduleId: moduleDoc._id }).select('_id');
  return subs.length > 0 && subs.every((s) => completedSubModuleIds.has(s._id.toString()));
}

async function meetsCriteria(badge, stats) {
  const { type, value, moduleSlug } = badge.criteria;
  switch (type) {
    case 'level_reached':
      return stats.user.level >= value;
    case 'xp_reached':
      return stats.user.xp >= value;
    case 'module_completed':
      return isModuleCompleted(moduleSlug, stats.completedSubModuleIds);
    default:
      return (stats[type] || 0) >= value;
  }
}

/**
 * Évalue tous les badges actifs non encore obtenus et attribue ceux dont les
 * critères sont remplis. Idempotent (index unique {userId, badgeId}) : peut
 * être appelé après n'importe quel événement de progression.
 */
async function evaluate(userId) {
  const stats = await computeStats(userId);
  if (!stats) return [];

  const owned = await UserBadge.find({ userId }).select('badgeId');
  const ownedIds = owned.map((o) => o.badgeId);
  const candidates = await Badge.find({ isActive: true, _id: { $nin: ownedIds } });

  const earned = [];
  for (const badge of candidates) {
    if (!(await meetsCriteria(badge, stats))) continue;
    try {
      await UserBadge.create({ userId, badgeId: badge._id });
    } catch (err) {
      if (err.code === 11000) continue;
      throw err;
    }
    earned.push(badge);
    await notify(userId, 'badge_earned', `Nouveau badge débloqué : « ${badge.title} » !`);
  }
  return earned;
}

module.exports = { evaluate };
