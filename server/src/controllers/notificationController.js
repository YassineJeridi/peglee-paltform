const mongoose = require('mongoose');
const { Notification, Event } = require('../models');
const { notify } = require('../services/notificationService');
const ApiError = require('../utils/ApiError');

// Rappels générés à la lecture (pas de cron nécessaire) : événements des prochaines 24 h,
// dédupliqués par id d'événement.
async function generateEventReminders(userId) {
  const now = new Date();
  const events = await Event.find({
    userId,
    start: { $gt: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
  });
  for (const ev of events) {
    await notify(
      userId,
      'deadline_reminder',
      `Rappel : « ${ev.title} » a lieu le ${ev.start.toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Africa/Tunis',
      })}.`,
      `event:${ev._id}`
    );
  }
}

async function listNotifications(req, res, next) {
  try {
    await generateEventReminders(req.user.id);
    const [items, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id }).sort({ read: 1, createdAt: -1 }).limit(30),
      Notification.countDocuments({ userId: req.user.id, read: false }),
    ]);
    res.json({ unreadCount, items });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Identifiant invalide.');
    const n = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!n) throw new ApiError(404, 'Notification introuvable.');
    res.json(n);
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: 'Toutes les notifications sont marquées comme lues.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markRead, markAllRead };
