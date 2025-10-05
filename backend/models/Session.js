const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: String
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);