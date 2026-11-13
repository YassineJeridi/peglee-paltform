const mongoose = require('mongoose');
const { Progress, SubModule } = require('../models');
const ApiError = require('../utils/ApiError');
const xpService = require('../services/xpService');
const xpRules = require('../config/xpRules');
const { getStudentOverview, getRecentActivity, getActivitySeries } = require('../services/progressService');

async function completeLesson(req, res, next) {
  try {
    const { subModuleId } = req.params;

    if (!mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const subModule = await SubModule.findById(subModuleId);
    if (!subModule) {
      throw new ApiError(404, 'Sous-module introuvable.');
    }

    let progress = await Progress.findOne({ userId: req.user.id, subModuleId });
    const alreadyCompleted = progress ? progress.lessonCompleted === true : false;

    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        subModuleId,
        lessonCompleted: true,
        status: 'in_progress',
      });
    } else if (!progress.lessonCompleted) {
      progress.lessonCompleted = true;
      if (progress.status === 'locked') progress.status = 'in_progress';
      await progress.save();
    }

    let leveledUp = false;
    if (!alreadyCompleted) {
      const result = await xpService.award(req.user.id, xpRules.LESSON_COMPLETED);
      leveledUp = result.leveledUp;
    }

    res.json({ lessonCompleted: progress.lessonCompleted, status: progress.status, leveledUp });
  } catch (err) {
    next(err);
  }
}

async function getMyProgress(req, res, next) {
  try {
    const [overview, recentActivity] = await Promise.all([
      getStudentOverview(req.user.id),
      getRecentActivity(req.user.id),
    ]);

    // Le calcul exact des paliers est finalisé en Phase 5 (tâche 5.1) ; on
    // expose déjà xpIntoLevel/xpForNextLevel ici avec la formule actuelle
    // pour que l'overview affiche une barre de progression cohérente.
    const levelInfo = xpService.computeLevel(req.user.xp);

    res.json({
      ...overview,
      xp: req.user.xp,
      level: req.user.level,
      xpIntoLevel: levelInfo.xpIntoLevel,
      xpForNextLevel: levelInfo.xpForNextLevel,
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyActivity(req, res, next) {
  try {
    const period = req.query.period === 'month' ? 'month' : 'week';
    const series = await getActivitySeries(req.user.id, period);
    res.json({ period, series });
  } catch (err) {
    next(err);
  }
}

module.exports = { completeLesson, getMyProgress, getMyActivity };
