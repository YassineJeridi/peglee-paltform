const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    type: {
      type: String,
      enum: ['revision', 'quiz', 'examen', 'personnel'],
      default: 'personnel',
    },
    color: { type: String, default: '' },
  },
  { timestamps: true }
);

eventSchema.index({ userId: 1, start: 1 });

module.exports = mongoose.model('Event', eventSchema);
