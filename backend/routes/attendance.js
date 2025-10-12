const express = require("express");
const crypto = require("crypto");
const Session = require("../models/Session");

const router = express.Router();

const gen = (n = 10) => crypto.randomBytes(16).toString("hex").slice(0, n);

/**
 * POST /api/attendance/:id/join
 * body: { name }
 * returns: { attendanceCode }
 */
router.post("/:id/join", async (req, res) => {
  try {
    const s = await Session.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });

    if (s.maxParticipants && s.attendees.length >= s.maxParticipants) {
      return res.status(400).json({ error: "Session is full" });
    }

    const name = (req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name required" });

    const attendanceCode = gen(10);
    s.attendees.push({ name, attendanceCode });
    await s.save();

    // mock "email" for attendees if session.email is set (optional)
    console.log(
      `[mock-email] attendance -> ${name} joined ${s._id}. ` +
        `Attendance code: ${attendanceCode}`
    );

    return res.json({ attendanceCode });
  } catch (err) {
    console.error("Join error:", err);
    return res.status(500).json({ error: "Join failed" });
  }
});

/**
 * POST /api/attendance/:id/leave
 * body: { code }
 */
router.post("/:id/leave", async (req, res) => {
  try {
    const s = await Session.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });

    const code = (req.body?.code || "").trim();
    if (!code) return res.status(400).json({ error: "Code required" });

    const idx = s.attendees.findIndex((a) => a.attendanceCode === code);
    if (idx === -1) return res.status(400).json({ error: "Invalid code" });

    s.attendees.splice(idx, 1);
    await s.save();
    return res.json({ success: true });
  } catch (err) {
    console.error("Leave error:", err);
    return res.status(500).json({ error: "Leave failed" });
  }
});

/**
 * POST /api/attendance/:id/remove
 * body: { code: managementCode, attendanceCode?, attendeeName? }
 */
router.post("/:id/remove", async (req, res) => {
  try {
    const s = await Session.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });

    const mg = (req.body?.code || "").trim();
    if (mg !== s.managementCode) {
      return res.status(403).json({ error: "Management code required" });
    }

    const { attendanceCode, attendeeName } = req.body || {};
    let changed = false;

    if (attendanceCode) {
      const i = s.attendees.findIndex(
        (a) => a.attendanceCode === attendanceCode
      );
      if (i !== -1) {
        s.attendees.splice(i, 1);
        changed = true;
      }
    } else if (attendeeName) {
      const i = s.attendees.findIndex((a) => a.name === attendeeName);
      if (i !== -1) {
        s.attendees.splice(i, 1);
        changed = true;
      }
    }

    if (!changed) {
      return res.status(400).json({ error: "Attendee not found" });
    }

    await s.save();
    return res.json({ success: true });
  } catch (err) {
    console.error("Remove error:", err);
    return res.status(500).json({ error: "Remove failed" });
  }
});

module.exports = router;