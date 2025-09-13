const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  image: String // stores filename relative to uploads/
}, { timestamps: true });
module.exports = mongoose.model('Task', TaskSchema);
