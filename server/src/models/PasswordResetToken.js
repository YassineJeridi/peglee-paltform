const mongoose = require('mongoose');

// Jeton de réinitialisation à usage unique. Seul le hash SHA-256 est stocké :
// le jeton en clair n'existe que dans l'e-mail envoyé à l'utilisateur.
const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Purge automatique des jetons expirés par MongoDB (TTL).
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
