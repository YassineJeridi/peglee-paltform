const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' },
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    subModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubModule',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    statement: { type: String, required: true },
    type: { type: String, enum: ['algorithme', 'python'], required: true },
    starterCode: { type: String, default: '' },
    solution: { type: String, default: '' },
    difficulty: { type: String, enum: ['facile', 'moyen', 'difficile'], default: 'moyen' },
    order: { type: Number, default: 0 },
    tests: { type: [testSchema], default: [] },
  },
  { timestamps: true }
);

exerciseSchema.index({ subModuleId: 1, order: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
