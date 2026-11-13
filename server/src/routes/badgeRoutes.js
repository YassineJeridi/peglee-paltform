const express = require('express');
const {
  getMyBadges,
  listBadgesForAdmin,
  createBadge,
  updateBadge,
  deleteBadge,
} = require('../controllers/badgeController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const router = express.Router();

router.get('/me', auth, getMyBadges);

router.get('/manage', auth, role('admin'), listBadgesForAdmin);
router.post('/', auth, role('admin'), createBadge);
router.put('/:id', auth, role('admin'), updateBadge);
router.delete('/:id', auth, role('admin'), deleteBadge);

module.exports = router;
