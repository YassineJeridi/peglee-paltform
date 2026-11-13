const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['badge_earned', 'level_up', 'deadline_reminder', 'info'],
      required: true,
    },
    message: { type: String, required: true, maxlength: 300 },
    read: { type: Boolean, default: false },
    // Clé d'idempotence optionnelle (ex. rappel d'événement déjà envoyé).
    dedupeKey: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } }
);

module.exports = mongoose.model('Notification', notificationSchema);
