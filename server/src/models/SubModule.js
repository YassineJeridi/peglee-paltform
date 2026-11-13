const mongoose = require('mongoose');

const subModuleSchema = new mongoose.Schema(
  {
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    estimatedDuration: { type: Number, min: 0 },
  },
  { timestamps: true }
);

subModuleSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model('SubModule', subModuleSchema);
