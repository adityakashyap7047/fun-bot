const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, default: '' },
  type: { type: String, enum: ['meeting', 'call', 'deadline'], default: 'meeting' },
  date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
