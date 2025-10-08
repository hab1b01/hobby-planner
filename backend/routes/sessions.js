const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create session' });
  }
});

router.post("/:id/attend", async (req, res) => {
  try {
    const id = req.params.id;
    const session = await Session.findById(id);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const attendanceCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    session.attendees.push({ 
      name: req.body.name || "Guest", 
      attendanceCode 
    });
    
    await session.save();
    
    res.json({ 
      message: "Successfully joined session", 
      attendanceCode 
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/unattend", async (req, res) => {
  try {
    const id = req.params.id;
    const { attendanceCode } = req.body;
    
    const session = await Session.findById(id);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.attendees = session.attendees.filter(
      (attendee) => attendee.attendanceCode !== attendanceCode
    );
    
    await session.save();
    
    res.json({ message: "Successfully left session" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;