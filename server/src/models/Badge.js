const mongoose = require('mongoose');

const CRITERIA_TYPES = [
  'lessons_completed',
  'quizzes_passed',
  'exercises_completed',
  'submodules_completed',
  'module_completed',
  'level_reached',
  'xp_reached',
];

const badgeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    icon: { type: String, default: '🏆', trim: true, maxlength: 40 },
    criteria: {
      type: { type: String, enum: CRITERIA_TYPES, required: true },
      // Seuil numérique (nombre d'éléments, niveau ou XP) — ignoré pour module_completed.
      value: { type: Number, default: 1, min: 1 },
      // Uniquement pour module_completed.
      moduleSlug: { type: String, default: '', trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

badgeSchema.statics.CRITERIA_TYPES = CRITERIA_TYPES;

module.exports = mongoose.model('Badge', badgeSchema);
