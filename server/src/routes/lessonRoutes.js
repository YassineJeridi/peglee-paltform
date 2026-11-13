const express = require('express');
const { getLesson, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const router = express.Router();

router.get('/:subModuleId', auth, getLesson);

// Écriture, réservée aux admins (tâche 4.5).
router.post('/', auth, role('admin'), createLesson);
router.put('/:id', auth, role('admin'), updateLesson);
router.delete('/:id', auth, role('admin'), deleteLesson);

module.exports = router;
