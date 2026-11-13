const mongoose = require('mongoose');
const { Exercise, Progress, SubModule } = require('../models');
const ApiError = require('../utils/ApiError');
const xpService = require('../services/xpService');
const xpRules = require('../config/xpRules');
const { runTests } = require('../services/codeExecutionService');

const EXERCISE_TYPES = ['algorithme', 'python'];

const QUIZ_NOT_PASSED_MESSAGE = 'Vous devez réussir le quiz avant d\'accéder aux exercices.';

async function assertQuizPassed(userId, subModuleId) {
  const progress = await Progress.findOne({ userId, subModuleId });
  if (!progress || progress.quizPassed !== true) {
    throw new ApiError(403, QUIZ_NOT_PASSED_MESSAGE);
  }
  return progress;
}

function sanitizeTests(tests) {
  if (!Array.isArray(tests)) return [];
  return tests.slice(0, 20).map((t) => ({
    input: String(t?.input ?? '').slice(0, 5000),
    expectedOutput: String(t?.expectedOutput ?? '').slice(0, 5000),
  }));
}

async function getExercises(req, res, next) {
  try {
    const { subModuleId } = req.params;

    if (!mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const progress = await assertQuizPassed(req.user.id, subModuleId);
    const completedIds = new Set(progress.exercisesCompleted.map((id) => id.toString()));

    const exercises = await Exercise.find({ subModuleId }).sort({ order: 1 });

    res.json(
      exercises.map((ex) => ({
        _id: ex._id,
        title: ex.title,
        statement: ex.statement,
        type: ex.type,
        starterCode: ex.starterCode,
        difficulty: ex.difficulty,
        order: ex.order,
        runnable: ex.type === 'python' && ex.tests.length > 0,
        completed: completedIds.has(ex._id.toString()),
      }))
    );
  } catch (err) {
    next(err);
  }
}

async function runExercise(req, res, next) {
  try {
    const { exerciseId } = req.params;
    if (!mongoose.isValidObjectId(exerciseId)) {
      throw new ApiError(400, "Identifiant d'exercice invalide.");
    }
    const { code } = req.body;
    if (typeof code !== 'string' || !code.trim()) {
      throw new ApiError(400, 'Le code est requis.');
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) throw new ApiError(404, 'Exercice introuvable.');
    if (exercise.type !== 'python' || exercise.tests.length === 0) {
      throw new ApiError(400, "Cet exercice n'est pas exécutable automatiquement.");
    }
    await assertQuizPassed(req.user.id, exercise.subModuleId);

    const results = await runTests(code, exercise.tests).catch((err) => {
      if (err.code === 'ENGINE_DISABLED') throw new ApiError(503, err.message);
      throw new ApiError(502, "Le moteur d'exécution est indisponible.");
    });
    res.json({ allPassed: results.every((r) => r.passed), results });
  } catch (err) {
    next(err);
  }
}

// Garde-fou qualité admin : vérifie que la solution de référence passe ses propres tests.
async function runExerciseSolution(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Identifiant d'exercice invalide.");
    const exercise = await Exercise.findById(id);
    if (!exercise) throw new ApiError(404, 'Exercice introuvable.');
    if (exercise.type !== 'python' || exercise.tests.length === 0) {
      throw new ApiError(400, "Cet exercice n'a pas de cas de test Python.");
    }
    const results = await runTests(exercise.solution, exercise.tests).catch((err) => {
      if (err.code === 'ENGINE_DISABLED') throw new ApiError(503, err.message);
      throw new ApiError(502, "Le moteur d'exécution est indisponible.");
    });
    res.json({ allPassed: results.every((r) => r.passed), results });
  } catch (err) {
    next(err);
  }
}

async function getExerciseSolution(req, res, next) {
  try {
    const { exerciseId } = req.params;

    if (!mongoose.isValidObjectId(exerciseId)) {
      throw new ApiError(400, 'Identifiant d\'exercice invalide.');
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      throw new ApiError(404, 'Exercice introuvable.');
    }

    await assertQuizPassed(req.user.id, exercise.subModuleId);

    res.json({ solution: exercise.solution });
  } catch (err) {
    next(err);
  }
}

async function completeExercise(req, res, next) {
  try {
    const { exerciseId } = req.params;

    if (!mongoose.isValidObjectId(exerciseId)) {
      throw new ApiError(400, 'Identifiant d\'exercice invalide.');
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      throw new ApiError(404, 'Exercice introuvable.');
    }

    // Même garde que getExercises : un élève ne doit pas pouvoir marquer un
    // exercice résolu sans y avoir légitimement accès (§11.6).
    const progress = await assertQuizPassed(req.user.id, exercise.subModuleId);

    const alreadyCompleted = progress.exercisesCompleted.some(
      (id) => id.toString() === exerciseId
    );

    let leveledUp = false;

    if (!alreadyCompleted) {
      progress.exercisesCompleted.addToSet(exercise._id);

      const totalExercises = await Exercise.countDocuments({ subModuleId: exercise.subModuleId });
      const allExercisesDone = progress.exercisesCompleted.length >= totalExercises;

      // Recalcul complet des 3 conditions plutôt qu'une mise à jour
      // incrémentale, pour éviter tout état de progression incohérent.
      let subModuleJustCompleted = false;
      if (
        allExercisesDone &&
        progress.lessonCompleted &&
        progress.quizPassed &&
        progress.status !== 'completed'
      ) {
        progress.status = 'completed';
        progress.completedAt = new Date();
        subModuleJustCompleted = true;
      }

      await progress.save();

      const exerciseXp = await xpService.award(req.user.id, xpRules.EXERCISE_COMPLETED);
      leveledUp = exerciseXp.leveledUp;

      if (subModuleJustCompleted) {
        const completionXp = await xpService.award(req.user.id, xpRules.SUBMODULE_COMPLETED);
        leveledUp = leveledUp || completionXp.leveledUp;
      }
    }

    res.json({
      exercisesCompleted: progress.exercisesCompleted.length,
      status: progress.status,
      leveledUp,
    });
  } catch (err) {
    next(err);
  }
}

// Réservé à l'admin : tous les champs y compris `solution`, sans la garde
// `quizPassed` (l'admin n'a pas de Progress élève) — jamais réutilisé côté
// élève (cf. getExercises ci-dessus, qui exclut `solution`).
async function getExercisesForAdmin(req, res, next) {
  try {
    const { subModuleId } = req.params;

    if (!mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const exercises = await Exercise.find({ subModuleId }).sort({ order: 1 });
    res.json(exercises);
  } catch (err) {
    next(err);
  }
}

async function createExercise(req, res, next) {
  try {
    const { subModuleId, title, statement, type, starterCode, solution, difficulty, order, tests } = req.body;

    if (!subModuleId || !mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }
    if (!title || !statement) {
      throw new ApiError(400, "Le titre et l'énoncé sont requis.");
    }
    if (!EXERCISE_TYPES.includes(type)) {
      throw new ApiError(400, "Type d'exercice invalide.");
    }

    const subModule = await SubModule.findById(subModuleId);
    if (!subModule) {
      throw new ApiError(404, 'Sous-module introuvable.');
    }

    // Pas de contrainte d'unicité : plusieurs exercices par sous-module.
    const exercise = await Exercise.create({
      subModuleId,
      title,
      statement,
      type,
      starterCode,
      solution,
      difficulty,
      order,
      tests: sanitizeTests(tests),
    });

    res.status(201).json(exercise);
  } catch (err) {
    next(err);
  }
}

async function updateExercise(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Identifiant d'exercice invalide.");
    }

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      throw new ApiError(404, 'Exercice introuvable.');
    }

    const { title, statement, type, starterCode, solution, difficulty, order, tests } = req.body;

    if (title !== undefined) exercise.title = title;
    if (statement !== undefined) exercise.statement = statement;
    if (type !== undefined) {
      if (!EXERCISE_TYPES.includes(type)) {
        throw new ApiError(400, "Type d'exercice invalide.");
      }
      exercise.type = type;
    }
    if (starterCode !== undefined) exercise.starterCode = starterCode;
    if (solution !== undefined) exercise.solution = solution;
    if (difficulty !== undefined) exercise.difficulty = difficulty;
    if (order !== undefined) exercise.order = order;
    if (tests !== undefined) exercise.tests = sanitizeTests(tests);

    await exercise.save();
    res.json(exercise);
  } catch (err) {
    next(err);
  }
}

async function deleteExercise(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Identifiant d'exercice invalide.");
    }

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      throw new ApiError(404, 'Exercice introuvable.');
    }

    const { subModuleId } = exercise;
    await exercise.deleteOne();

    // Retire la référence orpheline chez tous les élèves qui l'avaient déjà
    // résolu, pour garder exercisesCompleted.length / totalExercises
    // cohérent (§ règles métier, cf. logique de complétion tâche 2.5).
    await Progress.updateMany({ subModuleId, exercisesCompleted: id }, { $pull: { exercisesCompleted: id } });

    // Recalcule le statut des Progress de ce sous-module qui pourraient
    // désormais être « terminées » — jamais l'inverse : si un élève avait
    // déjà résolu tous les exercices restants, retirer un exercice qu'il
    // n'avait PAS résolu ne peut que le rapprocher de la complétion, jamais
    // l'en éloigner (totalExercises et son compte baissent symétriquement
    // s'il avait résolu l'exercice supprimé).
    const totalExercises = await Exercise.countDocuments({ subModuleId });
    const candidates = await Progress.find({
      subModuleId,
      status: { $ne: 'completed' },
      lessonCompleted: true,
      quizPassed: true,
    });

    await Promise.all(
      candidates
        .filter((p) => p.exercisesCompleted.length >= totalExercises)
        .map((p) => {
          p.status = 'completed';
          p.completedAt = new Date();
          return p.save();
        })
    );

    res.json({ message: 'Exercice supprimé.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  runExercise,
  runExerciseSolution,
  getExercises,
  getExerciseSolution,
  completeExercise,
  getExercisesForAdmin,
  createExercise,
  updateExercise,
  deleteExercise,
};
