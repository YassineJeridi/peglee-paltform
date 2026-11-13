const express = require('express');
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, listNotifications);
// Déclaré avant '/:id/read' pour ne pas être capturé comme un id.
router.put('/read-all', auth, markAllRead);
router.put('/:id/read', auth, markRead);

module.exports = router;
