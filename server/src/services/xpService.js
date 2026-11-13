const { User } = require('../models');
const xpRules = require('../config/xpRules');
const { notify } = require('./notificationService');
const badgeService = require('./badgeService');

/**
 * Détermine le niveau atteint pour une quantité d'XP donnée, à partir de la
 * table de paliers (§13.3). Fonction pure, réutilisée pour l'affichage de la
 * barre de progression côté frontend (tâche 5.1).
 */
function computeLevel(xp) {
  const thresholds = xpRules.LEVEL_THRESHOLDS;

  let level = 1;
  for (let i = 1; i < thresholds.length; i += 1) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }

  const currentThreshold = thresholds[level - 1];
  const nextThreshold = level < thresholds.length ? thresholds[level] : null;

  return {
    level,
    xpIntoLevel: xp - currentThreshold,
    xpForNextLevel: nextThreshold === null ? null : nextThreshold - currentThreshold,
  };
}

/**
 * Attribue de l'XP à un utilisateur et recalcule son niveau dans la même
 * opération, pour ne jamais désynchroniser `xp` et `level`.
 */
async function award(userId, amount) {
  if (!amount || amount <= 0) return { leveledUp: false, xp: null, level: null };

  const user = await User.findById(userId);
  if (!user) return { leveledUp: false, xp: null, level: null };

  const previousLevel = user.level;
  user.xp += amount;
  user.level = computeLevel(user.xp).level;
  await user.save();

  // Effets de bord (notifications, badges) : ne doivent jamais faire échouer
  // l'action de progression de l'élève.
  try {
    if (user.level > previousLevel) {
      await notify(userId, 'level_up', `Félicitations, vous êtes passé au niveau ${user.level} !`);
    }
    await badgeService.evaluate(userId);
  } catch (err) {
    console.error('[badges] Évaluation échouée :', err.message);
  }

  return { leveledUp: user.level > previousLevel, xp: user.xp, level: user.level };
}

function quizPassedXp(score, passingScore) {
  const bonus = Math.min(
    Math.max(score - passingScore, 0) * xpRules.QUIZ_PASSED_BONUS_PER_POINT,
    xpRules.QUIZ_PASSED_BONUS_MAX
  );
  return Math.round(xpRules.QUIZ_PASSED_BASE + bonus);
}

module.exports = { award, computeLevel, quizPassedXp };
