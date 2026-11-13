const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubModule',
      required: true,
      index: true,
    },
    lessonCompleted: { type: Boolean, default: false },
    quizPassed: { type: Boolean, default: false },
    quizBestScore: { type: Number, default: 0, min: 0, max: 100 },
    exercisesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
    status: {
      type: String,
      enum: ['locked', 'in_progress', 'completed'],
      default: 'locked',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, subModuleId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
