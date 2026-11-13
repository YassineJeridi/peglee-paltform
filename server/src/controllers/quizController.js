const mongoose = require('mongoose');
const { Quiz, QuizAttempt, Progress, SubModule } = require('../models');
const ApiError = require('../utils/ApiError');
const { gradeQuiz } = require('../services/quizService');
const xpService = require('../services/xpService');
const { validateQuizFields, normalizeAndValidateQuestions } = require('../validators/quizValidators');
const { getOrCreateSettings } = require('../services/settingsService');

async function getQuiz(req, res, next) {
  try {
    const { subModuleId } = req.params;

    if (!mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const quiz = await Quiz.findOne({ subModuleId });
    if (!quiz) {
      throw new ApiError(404, "Aucun quiz n'est encore disponible pour ce sous-module.");
    }

    const [attemptsCount, progress] = await Promise.all([
      QuizAttempt.countDocuments({ userId: req.user.id, quizId: quiz._id }),
      Progress.findOne({ userId: req.user.id, subModuleId }),
    ]);

    const questions = quiz.questions.map((q) => ({
      _id: q._id,
      text: q.text,
      type: q.type,
      options: q.options,
      points: q.points,
    }));

    res.json({
      _id: quiz._id,
      subModuleId: quiz.subModuleId,
      title: quiz.title,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions,
      attemptsCount,
      attemptsRemaining:
        quiz.maxAttempts === 0 ? null : Math.max(quiz.maxAttempts - attemptsCount, 0),
      bestScore: progress ? progress.quizBestScore : 0,
    });
  } catch (err) {
    next(err);
  }
}

async function submitQuiz(req, res, next) {
  try {
    const { quizId } = req.params;
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

    if (!mongoose.isValidObjectId(quizId)) {
      throw new ApiError(400, 'Identifiant de quiz invalide.');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz introuvable.');
    }

    const attemptsCount = await QuizAttempt.countDocuments({ userId: req.user.id, quizId });
    if (quiz.maxAttempts > 0 && attemptsCount >= quiz.maxAttempts) {
      throw new ApiError(403, 'Nombre maximal de tentatives atteint pour ce quiz.');
    }

    const { score, passed, details } = gradeQuiz(quiz, answers);

    await QuizAttempt.create({
      userId: req.user.id,
      quizId: quiz._id,
      answers,
      score,
      passed,
    });

    let progress = await Progress.findOne({ userId: req.user.id, subModuleId: quiz.subModuleId });
    const wasAlreadyPassed = progress ? progress.quizPassed === true : false;

    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        subModuleId: quiz.subModuleId,
        status: 'in_progress',
        quizBestScore: score,
        quizPassed: passed,
      });
    } else {
      progress.quizBestScore = Math.max(progress.quizBestScore, score);
      if (passed) progress.quizPassed = true;
      if (progress.status === 'locked') progress.status = 'in_progress';
      await progress.save();
    }

    let leveledUp = false;
    if (passed && !wasAlreadyPassed) {
      const xpAmount = xpService.quizPassedXp(score, quiz.passingScore);
      const result = await xpService.award(req.user.id, xpAmount);
      leveledUp = result.leveledUp;
    }

    const detailsByQuestionId = new Map(details.map((d) => [d.questionId, d]));
    const correction = quiz.questions.map((q) => {
      const questionId = q._id.toString();
      const detail = detailsByQuestionId.get(questionId);
      return {
        questionId,
        correct: detail ? detail.correct : false,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
      };
    });

    res.json({
      score,
      passed,
      passingScore: quiz.passingScore,
      quizBestScore: progress.quizBestScore,
      correction,
      leveledUp,
    });
  } catch (err) {
    next(err);
  }
}

// Réservé à l'admin : document complet, y compris `correctAnswers` et
// `explanation` — ne JAMAIS réutiliser ce sérialiseur pour un endpoint élève
// (cf. getQuiz ci-dessus, qui filtre explicitement ces champs).
async function getQuizForAdmin(req, res, next) {
  try {
    const { subModuleId } = req.params;

    if (!mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const quiz = await Quiz.findOne({ subModuleId });
    if (!quiz) {
      throw new ApiError(404, "Aucun quiz n'existe encore pour ce sous-module.");
    }

    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

async function createQuiz(req, res, next) {
  try {
    const { subModuleId, title, passingScore, maxAttempts, questions } = req.body;

    if (!subModuleId || !mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }
    if (!title) {
      throw new ApiError(400, 'Le titre est requis.');
    }

    const subModule = await SubModule.findById(subModuleId);
    if (!subModule) {
      throw new ApiError(404, 'Sous-module introuvable.');
    }

    // Contrainte 1-1 déjà posée en base (index unique sur subModuleId).
    const existing = await Quiz.findOne({ subModuleId });
    if (existing) {
      throw new ApiError(
        409,
        "Un quiz existe déjà pour ce sous-module. Modifiez-le plutôt que d'en créer un nouveau.",
        [{ field: 'subModuleId', message: 'Un quiz existe déjà pour ce sous-module.' }]
      );
    }

    validateQuizFields({ passingScore, maxAttempts });
    const normalizedQuestions = normalizeAndValidateQuestions(questions || []);

    // Valeurs par défaut lues depuis Settings (tâche 4.8) plutôt que des
    // constantes codées en dur, pour que les réglages généraux soient
    // réellement utiles à la création d'un nouveau quiz.
    const settings = await getOrCreateSettings();

    const quiz = await Quiz.create({
      subModuleId,
      title,
      passingScore: passingScore ?? settings.defaultPassingScore,
      maxAttempts: maxAttempts ?? settings.defaultMaxAttempts,
      questions: normalizedQuestions,
    });

    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

async function updateQuiz(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de quiz invalide.');
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      throw new ApiError(404, 'Quiz introuvable.');
    }

    const { title, passingScore, maxAttempts, questions } = req.body;
    validateQuizFields({ passingScore, maxAttempts });

    if (title !== undefined) quiz.title = title;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (maxAttempts !== undefined) quiz.maxAttempts = maxAttempts;
    // Remplacement complet du tableau à chaque sauvegarde (choix MVP,
    // tâche 4.6) — les QuizAttempt déjà enregistrés gardent le score obtenu
    // au moment de la tentative, indépendamment de ce remplacement.
    if (questions !== undefined) {
      quiz.questions = normalizeAndValidateQuestions(questions);
    }

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

async function deleteQuiz(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de quiz invalide.');
    }

    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      throw new ApiError(404, 'Quiz introuvable.');
    }

    // Les QuizAttempt existants sont volontairement conservés (historique de
    // progression des élèves), même après suppression du quiz (§ règles métier).
    res.json({ message: 'Quiz supprimé.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuiz, submitQuiz, getQuizForAdmin, createQuiz, updateQuiz, deleteQuiz };
