const mongoose = require('mongoose');

const AttendeeSchema = new mongoose.Schema({
  id: { type: String, required: false }, // Optional ID field from second schema
  name: { type: String, required: true },
  attendanceCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: String, default: "" },
  time: { type: String, default: "" },
  maxParticipants: { type: Number, default: 0 },
  type: { type: String, enum: ["public", "private"], default: "public" },
  location: { type: String, default: "" },
  managementCode: { type: String, required: true },
  privateCode: { type: String, default: null },
  contactEmail: { type: String, default: "" },
  attendees: { type: [AttendeeSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', SessionSchema);