const express = require('express');
const {
  getModules,
  getSubModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} = require('../controllers/moduleController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const router = express.Router();

router.get('/', auth, getModules);
router.get('/:id/submodules', auth, getSubModules);

// Écriture, réservée aux admins (tâche 4.4). `/reorder` doit être déclaré
// avant `/:id` pour ne pas être capté par le paramètre générique.
router.post('/', auth, role('admin'), createModule);
router.put('/reorder', auth, role('admin'), reorderModules);
router.put('/:id', auth, role('admin'), updateModule);
router.delete('/:id', auth, role('admin'), deleteModule);

module.exports = router;
