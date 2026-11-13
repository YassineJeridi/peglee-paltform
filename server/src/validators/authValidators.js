const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new ApiError(422, 'Données invalides.', formatted);
  }
  next();
};

const registerValidators = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Le nom d\'utilisateur est requis.')
    .isLength({ min: 3, max: 30 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'e-mail est requis.')
    .isEmail()
    .withMessage('Format d\'e-mail invalide.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis.')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Les mots de passe ne correspondent pas.'),
  handleValidation,
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'e-mail est requis.')
    .isEmail()
    .withMessage('Format d\'e-mail invalide.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis.'),
  handleValidation,
];

const forgotPasswordValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'e-mail est requis.')
    .isEmail()
    .withMessage('Format d\'e-mail invalide.')
    .normalizeEmail(),
  handleValidation,
];

const resetPasswordValidators = [
  body('token').trim().notEmpty().withMessage('Le jeton est requis.'),
  body('newPassword')
    .notEmpty()
    .withMessage('Le mot de passe est requis.')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise.')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Les mots de passe ne correspondent pas.'),
  handleValidation,
];

module.exports = {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
};