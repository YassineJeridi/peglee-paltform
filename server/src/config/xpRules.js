module.exports = {
  LESSON_COMPLETED: 10,
  QUIZ_PASSED_BASE: 20,
  QUIZ_PASSED_BONUS_PER_POINT: 0.2,
  QUIZ_PASSED_BONUS_MAX: 20,
  EXERCISE_COMPLETED: 15,
  SUBMODULE_COMPLETED: 25,
  // Table de paliers explicite (index = niveau - 1) : plus prévisible et
  // ajustable palier par palier qu'une formule fermée, pour un catalogue
  // pédagogique borné (§13.3).
  LEVEL_THRESHOLDS: [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250],
};
