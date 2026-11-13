const express = require('express');
const { completeLesson, getMyProgress, getMyActivity } = require('../controllers/progressController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/lesson/:subModuleId/complete', auth, completeLesson);
router.get('/me', auth, getMyProgress);
router.get('/me/activity', auth, getMyActivity);

module.exports = router;
