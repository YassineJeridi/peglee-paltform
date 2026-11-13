const express = require('express');
const {
  getExercises,
  runExercise,
  runExerciseSolution,
  getExerciseSolution,
  completeExercise,
  getExercisesForAdmin,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exerciseController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { codeRunLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Lecture admin (tous les champs, y compris `solution`) — chemin distinct de
// la lecture élève ci-dessous, jamais le même sérialiseur.
router.get('/manage/:subModuleId', auth, role('admin'), getExercisesForAdmin);

router.get('/:subModuleId', auth, getExercises);
router.get('/:exerciseId/solution', auth, getExerciseSolution);
router.post('/:exerciseId/run', auth, codeRunLimiter, runExercise);
router.post('/:id/run-solution', auth, role('admin'), codeRunLimiter, runExerciseSolution);
router.post('/:exerciseId/complete', auth, completeExercise);

// Écriture, réservée aux admins (tâche 4.7).
router.post('/', auth, role('admin'), createExercise);
router.put('/:id', auth, role('admin'), updateExercise);
router.delete('/:id', auth, role('admin'), deleteExercise);

module.exports = router;
