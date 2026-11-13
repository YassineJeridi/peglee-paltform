function normalizeShortAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function isAnswerCorrect(question, submittedAnswer) {
  switch (question.type) {
    // `correctAnswers` est toujours un tableau d'index d'options pour ces
    // trois types (y compris single/boolean : `[1]`, pas `1`) — la
    // comparaison est donc une égalité d'ensembles dans tous les cas.
    case 'single':
    case 'boolean':
    case 'multiple': {
      const correct = Array.isArray(question.correctAnswers) ? question.correctAnswers : [];
      const submitted = Array.isArray(submittedAnswer) ? submittedAnswer : [];
      if (correct.length !== submitted.length) return false;
      const correctSet = new Set(correct);
      return submitted.every((a) => correctSet.has(a));
    }

    case 'short': {
      const correctOptions = Array.isArray(question.correctAnswers)
        ? question.correctAnswers
        : [question.correctAnswers];
      const normalizedSubmitted = normalizeShortAnswer(submittedAnswer);
      return correctOptions.some((c) => normalizeShortAnswer(c) === normalizedSubmitted);
    }

    default:
      return false;
  }
}

/**
 * Corrige un quiz côté serveur : fonction pure, sans accès DB, pour rester
 * testable unitairement (§18.1). `answers` est un tableau de
 * `{ questionId, answer }` — un élément par question répondue.
 */
function gradeQuiz(quiz, answers) {
  const answersByQuestionId = new Map((answers || []).map((a) => [String(a.questionId), a.answer]));

  let totalPoints = 0;
  let earnedPoints = 0;

  const details = quiz.questions.map((question) => {
    const questionId = question._id.toString();
    const submittedAnswer = answersByQuestionId.get(questionId);
    const correct = isAnswerCorrect(question, submittedAnswer);
    const points = question.points || 0;

    totalPoints += points;
    if (correct) earnedPoints += points;

    return { questionId, correct, pointsEarned: correct ? points : 0 };
  });

  const score = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
  const passed = score >= (quiz.passingScore ?? 60);

  return { score, passed, details };
}

module.exports = { gradeQuiz };
