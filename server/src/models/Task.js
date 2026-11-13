const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    color: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, status: 1, order: 1 });

module.exports = mongoose.model('Task', taskSchema);
