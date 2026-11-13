const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    subModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubModule',
      required: true,
      unique: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
