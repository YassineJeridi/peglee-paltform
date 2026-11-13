const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ['single', 'multiple', 'boolean', 'short'], required: true },
    options: { type: [String], default: [] },
    correctAnswers: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: '' },
    points: { type: Number, default: 1, min: 0 },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    subModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubModule',
      required: true,
      unique: true,
    },
    title: { type: String, required: true, trim: true },
    passingScore: { type: Number, default: 60, min: 0, max: 100 },
    // 0 = nombre de tentatives illimité
    maxAttempts: { type: Number, default: 0, min: 0 },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
