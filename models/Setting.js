const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const settingSchema = new mongoose.Schema({
  username: { type: String, default: 'admin' },
  password: { type: String, default: 'admin123' }
});

settingSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Only hash if not already hashed (bcrypt hashes start with $2a$ or $2b$)
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

settingSchema.methods.comparePassword = async function (candidate) {
  // If stored password is not hashed, compare plaintext directly
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    return candidate === this.password;
  }
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Setting', settingSchema);
