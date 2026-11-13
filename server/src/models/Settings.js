const mongoose = require('mongoose');

// Document singleton (un seul document en base, jamais référencé par id
// depuis ailleurs) — absent du §10 du cahier des charges, extension
// raisonnable pour porter les valeurs par défaut §7.7.
const settingsSchema = new mongoose.Schema(
  {
    defaultPassingScore: { type: Number, default: 60, min: 0, max: 100 },
    defaultMaxAttempts: { type: Number, default: 0, min: 0 },
    features: {
      codeExecution: { type: Boolean, default: false },
      badges: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
