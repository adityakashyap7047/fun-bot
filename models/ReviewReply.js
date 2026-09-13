const mongoose = require('mongoose');

const reviewReplySchema = new mongoose.Schema({
  testimonialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Testimonial', required: true },
  reply: { type: String, required: true },
  repliedBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ReviewReply', reviewReplySchema);
