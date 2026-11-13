const express = require('express');
const {
  createSubModule,
  updateSubModule,
  deleteSubModule,
  reorderSubModules,
} = require('../controllers/subModuleController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const router = express.Router();

// `/reorder` doit être déclaré avant `/:id` pour ne pas être capté par le
// paramètre générique.
router.post('/', auth, role('admin'), createSubModule);
router.put('/reorder', auth, role('admin'), reorderSubModules);
router.put('/:id', auth, role('admin'), updateSubModule);
router.delete('/:id', auth, role('admin'), deleteSubModule);

module.exports = router;
