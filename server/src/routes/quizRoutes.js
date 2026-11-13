const express = require('express');
const {
  getQuiz,
  submitQuiz,
  getQuizForAdmin,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quizController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const router = express.Router();

// Lecture admin (document complet, y compris les bonnes réponses) — chemin
// distinct de la lecture élève ci-dessous, jamais le même sérialiseur.
router.get('/manage/:subModuleId', auth, role('admin'), getQuizForAdmin);

router.get('/:subModuleId', auth, getQuiz);
router.post('/:quizId/submit', auth, submitQuiz);

// Écriture, réservée aux admins (tâche 4.6).
router.post('/', auth, role('admin'), createQuiz);
router.put('/:id', auth, role('admin'), updateQuiz);
router.delete('/:id', auth, role('admin'), deleteQuiz);

module.exports = router;
