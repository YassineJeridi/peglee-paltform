const ApiError = require('../utils/ApiError');

const QUESTION_TYPES = ['single', 'multiple', 'boolean', 'short'];

function validateQuizFields({ passingScore, maxAttempts }) {
  if (passingScore !== undefined && (typeof passingScore !== 'number' || passingScore < 0 || passingScore > 100)) {
    throw new ApiError(400, 'Le seuil de réussite doit être un nombre entre 0 et 100.', [
      { field: 'passingScore', message: 'Le seuil de réussite doit être un nombre entre 0 et 100.' },
    ]);
  }
  if (maxAttempts !== undefined && (typeof maxAttempts !== 'number' || maxAttempts < 0)) {
    throw new ApiError(400, 'Le nombre de tentatives doit être un nombre positif ou nul.', [
      { field: 'maxAttempts', message: 'Le nombre de tentatives doit être un nombre positif ou nul.' },
    ]);
  }
}

// Valide et normalise le tableau de questions à la sauvegarde (remplacement
// complet du tableau, choix MVP retenu plutôt que des sous-endpoints par
// question — cf. tâche 4.6). `correctAnswers` est un tableau d'index
// d'options pour single/multiple/boolean, une chaîne (ou un tableau de
// chaînes acceptées) pour short — même convention que services/quizService.js.
function normalizeAndValidateQuestions(questions) {
  if (!Array.isArray(questions)) {
    throw new ApiError(400, 'Les questions doivent être un tableau.');
  }

  return questions.map((q, index) => {
    const position = index + 1;

    if (!q.text || !q.text.toString().trim()) {
      throw new ApiError(400, `Question ${position} : l'énoncé est requis.`);
    }
    if (!QUESTION_TYPES.includes(q.type)) {
      throw new ApiError(400, `Question ${position} : type invalide.`);
    }

    let options = Array.isArray(q.options) ? q.options.filter((o) => o && o.toString().trim()) : [];
    let correctAnswers = q.correctAnswers;

    if (q.type === 'boolean' && options.length < 2) {
      options = ['Vrai', 'Faux'];
    }

    if (q.type === 'single' || q.type === 'multiple' || q.type === 'boolean') {
      if (options.length === 0) {
        throw new ApiError(400, `Question ${position} : au moins une option est requise.`);
      }

      const correctIndexes = Array.isArray(correctAnswers) ? correctAnswers : [];

      if (q.type === 'multiple') {
        if (correctIndexes.length === 0) {
          throw new ApiError(400, `Question ${position} : au moins une bonne réponse est requise.`);
        }
      } else if (correctIndexes.length !== 1) {
        throw new ApiError(400, `Question ${position} : exactement une bonne réponse est requise.`);
      }

      const outOfRange = correctIndexes.some((i) => typeof i !== 'number' || i < 0 || i >= options.length);
      if (outOfRange) {
        throw new ApiError(400, `Question ${position} : une bonne réponse référence une option inexistante.`);
      }

      correctAnswers = correctIndexes;
    }

    if (q.type === 'short') {
      const accepted = Array.isArray(correctAnswers)
        ? correctAnswers.map((a) => a?.toString().trim()).filter(Boolean)
        : correctAnswers?.toString().trim()
          ? [correctAnswers.toString().trim()]
          : [];

      if (accepted.length === 0) {
        throw new ApiError(400, `Question ${position} : au moins une réponse acceptée est requise.`);
      }

      correctAnswers = accepted.length === 1 ? accepted[0] : accepted;
    }

    return {
      text: q.text.toString().trim(),
      type: q.type,
      options,
      correctAnswers,
      explanation: q.explanation || '',
      points: typeof q.points === 'number' && q.points >= 0 ? q.points : 1,
    };
  });
}

module.exports = { validateQuizFields, normalizeAndValidateQuestions };
