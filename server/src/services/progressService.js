const { Module, SubModule, Progress, Exercise, QuizAttempt } = require('../models');

/**
 * Calcule le pourcentage de progression de chaque module pour un élève donné.
 * Un module sans sous-module renvoie 0 % (pas de division par zéro).
 */
async function attachModulesProgress(userId, modules) {
  const moduleIds = modules.map((m) => m._id);

  const subModules = await SubModule.find({ moduleId: { $in: moduleIds } }).select('moduleId');

  const totalByModule = {};
  const moduleBySubModule = {};
  subModules.forEach((sm) => {
    const moduleKey = sm.moduleId.toString();
    totalByModule[moduleKey] = (totalByModule[moduleKey] || 0) + 1;
    moduleBySubModule[sm._id.toString()] = moduleKey;
  });

  const completedProgress = await Progress.find({
    userId,
    subModuleId: { $in: subModules.map((sm) => sm._id) },
    status: 'completed',
  }).select('subModuleId');

  const completedByModule = {};
  completedProgress.forEach((p) => {
    const moduleKey = moduleBySubModule[p.subModuleId.toString()];
    if (moduleKey) completedByModule[moduleKey] = (completedByModule[moduleKey] || 0) + 1;
  });

  return modules.map((m) => {
    const key = m._id.toString();
    const total = totalByModule[key] || 0;
    const completed = completedByModule[key] || 0;
    const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { ...m.toObject(), progressPercent };
  });
}

/**
 * Enrichit les sous-modules d'un module avec le statut de progression de l'élève.
 *
 * Choix produit (§6.2.3 du cahier des charges) : les sous-modules d'un module
 * sont tous accessibles indépendamment les uns des autres — seul le triptyque
 * interne Leçon → Quiz → Exercices est verrouillé progressivement (voir tâches
 * 2.2 à 2.4). Un sous-module sans `Progress` n'est donc jamais `locked` ici,
 * il est considéré `in_progress` (accessible, pas encore commencé).
 */
async function attachSubModulesStatus(userId, moduleId) {
  const subModules = await SubModule.find({ moduleId }).sort({ order: 1 });
  const subModuleIds = subModules.map((sm) => sm._id);

  const [progressDocs, exercises] = await Promise.all([
    Progress.find({ userId, subModuleId: { $in: subModuleIds } }),
    Exercise.find({ subModuleId: { $in: subModuleIds } }).select('subModuleId'),
  ]);

  const progressBySubModule = new Map(progressDocs.map((p) => [p.subModuleId.toString(), p]));

  const exercisesTotalBySubModule = {};
  exercises.forEach((e) => {
    const key = e.subModuleId.toString();
    exercisesTotalBySubModule[key] = (exercisesTotalBySubModule[key] || 0) + 1;
  });

  return subModules.map((sm) => {
    const key = sm._id.toString();
    const exercisesTotal = exercisesTotalBySubModule[key] || 0;
    const progress = progressBySubModule.get(key);

    if (!progress) {
      return {
        ...sm.toObject(),
        status: 'in_progress',
        lessonCompleted: false,
        quizPassed: false,
        quizBestScore: 0,
        exercisesCompleted: 0,
        exercisesTotal,
      };
    }

    return {
      ...sm.toObject(),
      status: progress.status,
      lessonCompleted: progress.lessonCompleted,
      quizPassed: progress.quizPassed,
      quizBestScore: progress.quizBestScore,
      exercisesCompleted: progress.exercisesCompleted.length,
      exercisesTotal,
    };
  });
}

/**
 * Vue agrégée de la progression d'un élève, pensée pour alimenter directement
 * l'overview étudiant (tâche 2.9).
 */
async function getStudentOverview(userId) {
  const modules = await Module.find().sort({ order: 1 });
  const [modulesWithProgress, totalSubModules, progresses] = await Promise.all([
    attachModulesProgress(userId, modules),
    SubModule.countDocuments(),
    Progress.find({ userId }),
  ]);

  const subModulesCompleted = progresses.filter((p) => p.status === 'completed').length;
  const quizzesPassed = progresses.filter((p) => p.quizPassed).length;
  const passedScores = progresses.filter((p) => p.quizPassed).map((p) => p.quizBestScore);
  const averageQuizScore =
    passedScores.length === 0
      ? 0
      : Math.round(passedScores.reduce((sum, s) => sum + s, 0) / passedScores.length);
  const exercisesCompletedTotal = progresses.reduce(
    (sum, p) => sum + p.exercisesCompleted.length,
    0
  );
  const overallProgressPercent =
    totalSubModules === 0 ? 0 : Math.round((subModulesCompleted / totalSubModules) * 100);

  return {
    overallProgressPercent,
    subModulesCompleted,
    subModulesTotal: totalSubModules,
    quizzesPassed,
    averageQuizScore,
    exercisesCompletedTotal,
    modules: modulesWithProgress.map((m) => ({
      moduleId: m._id,
      title: m.title,
      progressPercent: m.progressPercent,
    })),
  };
}

/**
 * Flux d'activité récente (tâche 2.9) : on part simple, comme suggéré par la
 * tâche — tentatives de quiz récentes + sous-modules récemment mis à jour —
 * plutôt que d'introduire un flux d'événements dédié pour un MVP.
 */
async function getRecentActivity(userId, limit = 8) {
  const [recentAttempts, recentProgress] = await Promise.all([
    QuizAttempt.find({ userId })
      .sort({ attemptedAt: -1 })
      .limit(limit)
      .populate({ path: 'quizId', select: 'title subModuleId' }),
    Progress.find({ userId }).sort({ updatedAt: -1 }).limit(limit),
  ]);

  const subModuleIds = [
    ...recentAttempts.map((a) => a.quizId?.subModuleId).filter(Boolean),
    ...recentProgress.map((p) => p.subModuleId),
  ];
  const subModules = await SubModule.find({ _id: { $in: subModuleIds } }).select('title');
  const titleBySubModuleId = new Map(subModules.map((sm) => [sm._id.toString(), sm.title]));

  const attemptEvents = recentAttempts.map((a) => ({
    type: 'quiz_attempt',
    subModuleTitle: a.quizId?.subModuleId ? titleBySubModuleId.get(a.quizId.subModuleId.toString()) : null,
    score: a.score,
    passed: a.passed,
    at: a.attemptedAt,
  }));

  const progressEvents = recentProgress.map((p) => ({
    type: 'progress_update',
    subModuleTitle: titleBySubModuleId.get(p.subModuleId.toString()),
    status: p.status,
    lessonCompleted: p.lessonCompleted,
    quizPassed: p.quizPassed,
    at: p.updatedAt,
  }));

  return [...attemptEvents, ...progressEvents]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
}

/**
 * Série temporelle d'activité (tentatives de quiz par jour + score moyen)
 * pour le graphique de performance (tâche 2.9). Un jour sans tentative
 * renvoie `averageScore: null` (pas 0, pour ne pas laisser croire à un échec).
 */
async function getActivitySeries(userId, period) {
  const days = period === 'month' ? 30 : 7;

  // Découpage en jours calendaires UTC de bout en bout (bornes ET clés) :
  // mélanger des méthodes en heure locale (`setHours`/`setDate`) avec des
  // clés `toISOString()` (toujours en UTC) fait glisser "aujourd'hui" au
  // mauvais jour dès que le serveur ne tourne pas en UTC (repéré avec un
  // serveur en Africa/Tunis, UTC+1 : la tentative du jour même disparaissait
  // de la série).
  const now = new Date();
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const attempts = await QuizAttempt.find({ userId, attemptedAt: { $gte: since } }).select(
    'attemptedAt score'
  );

  const scoresByDay = new Map();
  attempts.forEach((a) => {
    const key = a.attemptedAt.toISOString().slice(0, 10);
    if (!scoresByDay.has(key)) scoresByDay.set(key, []);
    scoresByDay.get(key).push(a.score);
  });

  const series = [];
  for (let i = 0; i < days; i += 1) {
    const day = new Date(since);
    day.setUTCDate(since.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    const scores = scoresByDay.get(key) || [];
    series.push({
      date: key,
      attemptsCount: scores.length,
      averageScore: scores.length === 0 ? null : Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
    });
  }

  return series;
}

module.exports = {
  attachModulesProgress,
  attachSubModulesStatus,
  getStudentOverview,
  getRecentActivity,
  getActivitySeries,
};
