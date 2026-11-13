const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

moduleSchema.index({ order: 1 });

module.exports = mongoose.model('Module', moduleSchema);
