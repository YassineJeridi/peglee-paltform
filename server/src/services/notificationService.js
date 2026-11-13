const { Notification } = require('../models');

async function notify(userId, type, message, dedupeKey) {
  try {
    return await Notification.create({ userId, type, message, dedupeKey });
  } catch (err) {
    if (err.code === 11000) return null; // déjà envoyée
    throw err;
  }
}

module.exports = { notify };
