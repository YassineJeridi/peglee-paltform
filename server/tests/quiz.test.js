const mongoose = require('mongoose');
const { gradeQuiz } = require('../src/services/quizService');

function question(overrides) {
  return { _id: new mongoose.Types.ObjectId(), points: 1, ...overrides };
}

describe('gradeQuiz — question à choix unique (single)', () => {
  it('note correct/incorrect selon la réponse soumise', () => {
    const q = question({ type: 'single', correctAnswers: [1] });
    const quiz = { questions: [q], passingScore: 60 };

    const correct = gradeQuiz(quiz, [{ questionId: q._id, answer: [1] }]);
    expect(correct.score).toBe(100);
    expect(correct.passed).toBe(true);

    const wrong = gradeQuiz(quiz, [{ questionId: q._id, answer: [0] }]);
    expect(wrong.score).toBe(0);
    expect(wrong.passed).toBe(false);
  });
});

describe('gradeQuiz — question à choix multiple (multiple)', () => {
  it('exige une correspondance exacte de l\'ensemble des réponses', () => {
    const q = question({ type: 'multiple', correctAnswers: [0, 2] });
    const quiz = { questions: [q], passingScore: 60 };

    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: [0, 2] }]).score).toBe(100);
    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: [2, 0] }]).score).toBe(100);
    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: [0] }]).score).toBe(0);
    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: [0, 1] }]).score).toBe(0);
    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: [0, 1, 2] }]).score).toBe(0);
  });
});

describe('gradeQuiz — question vrai/faux (boolean)', () => {
  it('se comporte comme un choix unique à deux options', () => {
    const q = question({ type: 'boolean', correctAnswers: [1] });
    const quiz = { questions: [q], passingScore: 60 };

    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: [1] }]).passed).toBe(true);
    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: [0] }]).passed).toBe(false);
  });
});

describe('gradeQuiz — réponse courte (short)', () => {
  it('ignore la casse et les espaces superflus', () => {
    const q = question({ type: 'short', correctAnswers: ['Paris', 'Ville de Paris'] });
    const quiz = { questions: [q], passingScore: 60 };

    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: '  PARIS  ' }]).passed).toBe(true);
    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: 'ville   de   paris' }]).passed).toBe(true);
    expect(gradeQuiz(quiz, [{ questionId: q._id, answer: 'Lyon' }]).passed).toBe(false);
  });
});

describe('gradeQuiz — cas limites', () => {
  it('traite une question sans réponse soumise comme incorrecte', () => {
    const q = question({ type: 'single', correctAnswers: [0] });
    const quiz = { questions: [q], passingScore: 60 };

    expect(gradeQuiz(quiz, []).score).toBe(0);
  });

  it('réussit exactement au seuil de passingScore', () => {
    const questions = Array.from({ length: 5 }, () => question({ type: 'single', correctAnswers: [0] }));
    const quiz = { questions, passingScore: 60 };

    const answers = [
      ...questions.slice(0, 3).map((q) => ({ questionId: q._id, answer: [0] })), // 3 correctes
      ...questions.slice(3).map((q) => ({ questionId: q._id, answer: [1] })), // 2 incorrectes
    ];

    const result = gradeQuiz(quiz, answers);
    expect(result.score).toBe(60);
    expect(result.passed).toBe(true);
  });

  it('échoue juste en dessous du seuil de passingScore', () => {
    const questions = Array.from({ length: 5 }, () => question({ type: 'single', correctAnswers: [0] }));
    const quiz = { questions, passingScore: 60 };

    const answers = [
      ...questions.slice(0, 2).map((q) => ({ questionId: q._id, answer: [0] })), // 2/5 = 40%
      ...questions.slice(2).map((q) => ({ questionId: q._id, answer: [1] })),
    ];

    const result = gradeQuiz(quiz, answers);
    expect(result.score).toBe(40);
    expect(result.passed).toBe(false);
  });

  it('renvoie un score de 0 sans division par zéro quand le quiz n\'a aucun point', () => {
    const quiz = { questions: [], passingScore: 60 };
    const result = gradeQuiz(quiz, []);
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});
