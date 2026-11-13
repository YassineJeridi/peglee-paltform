const rateLimit = require('express-rate-limit');

// Désactivé en environnement de test : la suite (tests/roles.test.js,
// tests/isolation.test.js, ...) crée et connecte largement plus de comptes
// que la limite de 10 tentatives/15min ci-dessous, ce qui la ferait échouer
// avec des 429 sans rapport avec la logique testée.
const skipInTest = () => process.env.NODE_ENV === 'test';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Trop de tentatives, veuillez réessayer dans quelques minutes.' },
});

// Demandes de réinitialisation : plus strict que le login (évite le spam d'e-mails).
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Trop de demandes, veuillez réessayer plus tard.' },
});

// Exécution de code : coûteux en CPU.
const codeRunLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: "Trop d'exécutions, patientez une minute." },
});

module.exports = { apiLimiter, authLimiter, forgotPasswordLimiter, codeRunLimiter };
