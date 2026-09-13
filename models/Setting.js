const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const settingSchema = new mongoose.Schema({
  username: { type: String, required: true, default: 'admin' },
  password: { type: String, required: true }
});

settingSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

settingSchema.methods.comparePassword = async function (candidate) {
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
