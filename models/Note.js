const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  color: { type: String, default: '#6c5ce7' }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
