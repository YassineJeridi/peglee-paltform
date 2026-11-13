const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.host) return null;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

/**
 * Envoie un e-mail. Sans SMTP configuré : en développement/test, le message
 * est affiché dans la console (pratique pour récupérer le lien de
 * réinitialisation) ; en production, l'absence de SMTP est une erreur de
 * configuration signalée au démarrage (cf. config/env.js).
 */
async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    if (env.nodeEnv !== 'test') {
      console.log(`[email] (SMTP non configuré) À: ${to}\n  Sujet: ${subject}\n  ${text}`);
    }
    return { delivered: false };
  }
  await t.sendMail({ from: env.smtp.from, to, subject, text, html });
  return { delivered: true };
}

async function sendPasswordResetEmail(to, username, resetUrl) {
  const text =
    `Bonjour ${username},\n\n` +
    `Vous avez demandé la réinitialisation de votre mot de passe. ` +
    `Ouvrez le lien suivant (valable 1 heure, à usage unique) :\n\n${resetUrl}\n\n` +
    `Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.`;
  const html =
    `<p>Bonjour ${username},</p>` +
    `<p>Vous avez demandé la réinitialisation de votre mot de passe. ` +
    `Ce lien est valable 1 heure et utilisable une seule fois :</p>` +
    `<p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>` +
    `<p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</p>`;
  return sendMail({ to, subject: 'Réinitialisation de votre mot de passe', text, html });
}

module.exports = { sendMail, sendPasswordResetEmail };
