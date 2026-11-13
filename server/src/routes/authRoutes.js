const express = require('express');
const {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
} = require('../validators/authValidators');
const auth = require('../middlewares/auth');
const { authLimiter, forgotPasswordLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerValidators, register);
router.post('/login', authLimiter, loginValidators, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidators, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidators, resetPassword);
router.post('/logout', logout);
router.get('/me', auth, me);

module.exports = router;