const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const settingSchema = new mongoose.Schema({
  username: { type: String, default: 'admin' },
  password: { type: String, default: 'admin123' }
});

settingSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

settingSchema.methods.comparePassword = async function (candidate) {
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    return candidate === this.password;
  }
  return bcrypt.compare(candidate, this.password);
};

settingSchema.statics.findOrCreate = async function (filter, doc) {
  let result = await this.findOne(filter);
  if (!result) {
    result = await this.create(doc || filter);
  }
  return result;
};

module.exports = mongoose.model('Setting', settingSchema);
