const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { genManagementCode, genPrivateCode } = require('../utils/codes');

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
    const managementCode = genManagementCode();
    const privateCode = req.body.type === 'private' ? genPrivateCode() : null;
    
    const session = new Session({
      ...req.body,
      managementCode,
      privateCode,
      contactEmail: req.body.email || ''
    });
    
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(400).json({ error: 'Failed to create session' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.type === 'private' && session.privateCode !== req.query.code) {
      return res.status(403).json({ error: 'Private session - code required' });
    }
    
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.managementCode !== req.query.code) {
      return res.status(403).json({ error: 'Invalid management code' });
    }
    
    Object.assign(session, req.body);
    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.managementCode !== req.query.code) {
      return res.status(403).json({ error: 'Invalid management code' });
    }
    
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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

router.get("/:id/manage", async (req, res) => {
  try {
    const id = req.params.id;
    const { code } = req.query;
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: "Not found" });
    if (session.managementCode !== code)
      return res.status(403).json({ error: "Invalid code" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id/manage", async (req, res) => {
  try {
    const id = req.params.id;
    const { code } = req.query;
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ error: "Not found" });
    if (session.managementCode !== code)
      return res.status(403).json({ error: "Invalid code" });
    await Session.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;