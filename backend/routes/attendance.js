const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Session = require("../models/Session");
const { genAttendanceCode } = require("../utils/codes");

router.post("/:id/join", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "invalid id" });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const s = await Session.findById(id);
    if (!s) return res.status(404).json({ error: "Not found" });
    if (s.maxParticipants && s.attendees.length >= s.maxParticipants)
      return res.status(400).json({ error: "Session is full" });
    const attendanceCode = genAttendanceCode();
    s.attendees.push({ name, attendanceCode });
    await s.save();
    res.json({ success: true, attendanceCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/:id/leave", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "invalid id" });
    const { code } = req.body;
    if (!code)
      return res.status(400).json({ error: "attendance code required" });
    const s = await Session.findById(id);
    if (!s) return res.status(404).json({ error: "Not found" });
    const before = s.attendees.length;
    s.attendees = s.attendees.filter((a) => a.attendanceCode !== code);
    if (s.attendees.length === before)
      return res.status(400).json({ error: "invalid attendance code" });
    await s.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/:id/remove", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "invalid id" });
    const { code, attendeeName, attendanceCode } = req.body;
    if (!code)
      return res.status(400).json({ error: "management code required" });
    const s = await Session.findById(id);
    if (!s) return res.status(404).json({ error: "Not found" });
    if (code !== s.managementCode)
      return res.status(403).json({ error: "management code invalid" });
    const before = s.attendees.length;
    if (attendanceCode) {
      s.attendees = s.attendees.filter(
        (a) => a.attendanceCode !== attendanceCode
      );
    } else if (attendeeName) {
      s.attendees = s.attendees.filter((a) => a.name !== attendeeName);
    } else {
      return res
        .status(400)
        .json({ error: "attendeeName or attendanceCode required" });
    }
    if (s.attendees.length === before)
      return res.status(400).json({ error: "attendee not found" });
    await s.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;