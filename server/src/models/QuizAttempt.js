const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, quizId: 1, attemptedAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
