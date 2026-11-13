const express = require('express');
const { updateMe, changePassword, uploadAvatarHandler } = require('../controllers/userController');
const {
  listUsers,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} = require('../controllers/adminUserController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const uploadAvatar = require('../middlewares/uploadAvatar');

const router = express.Router();

// Profil de l'utilisateur courant (tâche 3.4).
router.put('/me', auth, updateMe);
router.put('/me/password', auth, changePassword);
router.post('/me/avatar', auth, uploadAvatar, uploadAvatarHandler);

// Gestion des utilisateurs, réservée aux admins (tâche 4.3).
router.get('/', auth, role('admin'), listUsers);
router.get('/:id', auth, role('admin'), getUserDetail);
router.post('/', auth, role('admin'), createUser);
router.put('/:id', auth, role('admin'), updateUser);
router.delete('/:id', auth, role('admin'), deleteUser);
router.post('/:id/reset-password', auth, role('admin'), resetPassword);

module.exports = router;
