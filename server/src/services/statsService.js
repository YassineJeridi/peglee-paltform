const { User, Module, SubModule, Lesson, Quiz, Exercise, Progress, QuizAttempt } = require('../models');

// Seuil documenté (§7.1 laisse le choix) : 30 jours reflète mieux un usage
// scolaire par nature intermittent (révisions ponctuelles) qu'une fenêtre de
// 7 jours, trop stricte pour qualifier un élève d'« actif ».
const ACTIVE_STUDENT_WINDOW_DAYS = 30;
const TIME_SERIES_DAYS = 30;

function utcStartOfDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Bornes ET clés de série en UTC de bout en bout — mélanger heure locale et
// clés `toISOString()` a déjà causé un vrai bug de fuseau horaire (tâche 2.9).
function fillDaySeries(start, days, countByDay) {
  const series = [];
  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    series.push({ date: key, count: countByDay.get(key) || 0 });
  }
  return series;
}

async function getTotals() {
  const startOfMonth = utcStartOfDay(new Date());
  startOfMonth.setUTCDate(1);

  const [users, newUsersThisMonth, modules, subModules, lessons, quizzes, exercises] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', createdAt: { $gte: startOfMonth } }),
    Module.countDocuments(),
    SubModule.countDocuments(),
    Lesson.countDocuments(),
    Quiz.countDocuments(),
    Exercise.countDocuments(),
  ]);

  return { users, newUsersThisMonth, modules, subModules, lessons, quizzes, exercises };
}

async function getRates() {
  const [totalSubModules, totalStudents, totalProgress, passedProgress, completedProgress] = await Promise.all([
    SubModule.countDocuments(),
    User.countDocuments({ role: 'student' }),
    Progress.countDocuments(),
    Progress.countDocuments({ quizPassed: true }),
    Progress.countDocuments({ status: 'completed' }),
  ]);

  // Taux de réussite aux quiz : parmi les sous-modules réellement ENTAMÉS par
  // un élève (Progress existant), proportion avec quiz réussi. Choix
  // documenté : diviser par le total théorique élèves × sous-modules
  // pénaliserait artificiellement les élèves qui n'ont simplement pas encore
  // commencé, ce qui n'est pas un échec.
  const quizPassRate = totalProgress === 0 ? 0 : Math.round((passedProgress / totalProgress) * 100);

  const activeSince = utcStartOfDay(new Date());
  activeSince.setUTCDate(activeSince.getUTCDate() - ACTIVE_STUDENT_WINDOW_DAYS);
  const activeStudents = await User.countDocuments({ role: 'student', lastLoginAt: { $gte: activeSince } });

  // Progression moyenne = moyenne, sur TOUS les élèves (y compris ceux sans
  // aucune Progress), du % de sous-modules terminés. Mathématiquement
  // équivalent à (nb de Progress "completed") / (nb élèves × nb
  // sous-modules) — pas besoin de grouper par élève pour ce total.
  const averageProgressPercent =
    totalStudents === 0 || totalSubModules === 0
      ? 0
      : Math.round((completedProgress / (totalStudents * totalSubModules)) * 100);

  return { quizPassRate, activeStudents, averageProgressPercent };
}

async function getRegistrationsTimeSeries(days = TIME_SERIES_DAYS) {
  const start = utcStartOfDay(new Date());
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const rows = await User.aggregate([
    { $match: { role: 'student', createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
        count: { $sum: 1 },
      },
    },
  ]);

  return fillDaySeries(start, days, new Map(rows.map((r) => [r._id, r.count])));
}

async function getActivityTimeSeries(days = TIME_SERIES_DAYS) {
  const start = utcStartOfDay(new Date());
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const rows = await QuizAttempt.aggregate([
    { $match: { attemptedAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$attemptedAt', timezone: 'UTC' } },
        count: { $sum: 1 },
      },
    },
  ]);

  return fillDaySeries(start, days, new Map(rows.map((r) => [r._id, r.count])));
}

// Répartition des élèves par module : nombre d'élèves distincts ayant au
// moins une Progress sur un sous-module de ce module. Part de la liste des
// modules (pas de Progress) pour que chaque module apparaisse, y compris
// avec 0 élève (base fraîchement seedée).
async function getStudentsByModule() {
  const modules = await Module.find().sort({ order: 1 }).select('title');
  if (modules.length === 0) return [];

  const rows = await Progress.aggregate([
    { $lookup: { from: 'submodules', localField: 'subModuleId', foreignField: '_id', as: 'subModule' } },
    { $unwind: '$subModule' },
    { $group: { _id: { moduleId: '$subModule.moduleId', userId: '$userId' } } },
    { $group: { _id: '$_id.moduleId', studentsCount: { $sum: 1 } } },
  ]);

  const countByModuleId = new Map(rows.map((r) => [r._id.toString(), r.studentsCount]));

  return modules.map((m) => ({
    moduleId: m._id,
    title: m.title,
    studentsCount: countByModuleId.get(m._id.toString()) || 0,
  }));
}

async function getAdminStats() {
  const [totals, rates, registrations, activity, studentsByModule] = await Promise.all([
    getTotals(),
    getRates(),
    getRegistrationsTimeSeries(),
    getActivityTimeSeries(),
    getStudentsByModule(),
  ]);

  return {
    totals,
    rates,
    timeSeries: { registrations, activity },
    studentsByModule,
  };
}

module.exports = { getAdminStats };
