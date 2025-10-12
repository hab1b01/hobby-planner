const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const crypto = require("crypto");


function genCode(len = 10) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
}


router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find({ type: "public" }).sort({
      date: 1,
      time: 1,
    });
    res.json(sessions);
  } catch (e) {
    console.error("List sessions error:", e);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      maxParticipants,
      type = "public",
      location,
      email,
    } = req.body;

    const managementCode = genCode(10);
    const privateCode = type === "private" ? genCode(10) : null;

    const s = new Session({
      title,
      description,
      date,
      time,
      maxParticipants,
      type,
      location,
      email,
      managementCode,
      privateCode,
    });

    await s.save();

    
    if (email) {
      console.log(
        `MOCK EMAIL → ${email}: Management Code: ${managementCode} ${
          privateCode ? `, Private Code: ${privateCode}` : ""
        }`
      );
    }
    console.log(`NOTIFY: Session "${title}" created.`);

    res.json({
      _id: s._id,
      managementCode: s.managementCode,
      privateCode: s.privateCode,
    });
  } catch (e) {
    console.error("Error creating session:", e);
    res.status(500).json({ error: "Failed to create session" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const s = await Session.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });

    const queryCode = (req.query.code || "").toString().trim();
    const headerCode = (req.headers["x-access-code"] || "").toString().trim();
    const incoming = queryCode || headerCode;

    if (s.type === "private") {
      const allowed =
        incoming === s.privateCode || incoming === s.managementCode;

      if (!allowed) {
        return res
          .status(403)
          .json({ error: "Private session. Code required." });
      }
    }

    res.json(s);
  } catch (e) {
    console.error("Get session error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

//ai helper 
router.put("/:id", async (req, res) => {
  try {
    const s = await Session.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });

    const queryCode = (req.query.code || "").toString().trim();
    const headerCode = (req.headers["x-access-code"] || "").toString().trim();
    const incoming = queryCode || headerCode;

    if (incoming !== s.managementCode) {
      return res.status(403).json({ error: "Management code invalid" });
    }

    const {
      title,
      description,
      date,
      time,
      maxParticipants,
      type,
      location,
      email,
    } = req.body;

    s.title = title ?? s.title;
    s.description = description ?? s.description;
    s.date = date ?? s.date;
    s.time = time ?? s.time;
    s.maxParticipants = maxParticipants ?? s.maxParticipants;
    s.type = type ?? s.type;
    s.location = location ?? s.location;
    s.email = email ?? s.email;

    // If turned into private and has no privateCode yet, generate one
    if (s.type === "private" && !s.privateCode) {
      s.privateCode = genCode(10);
    }
    // If turned public, clear privateCode
    if (s.type === "public") s.privateCode = null;

    await s.save();

    console.log(`NOTIFY: Session "${s.title}" updated.`);
    res.json({ success: true });
  } catch (e) {
    console.error("Update session error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete requires management code.
 */
router.delete("/:id", async (req, res) => {
  try {
    const s = await Session.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });

    const queryCode = (req.query.code || "").toString().trim();
    const headerCode = (req.headers["x-access-code"] || "").toString().trim();
    const incoming = queryCode || headerCode;

    if (incoming !== s.managementCode) {
      return res.status(403).json({ error: "Management code invalid" });
    }

    await s.deleteOne();
    console.log(`NOTIFY: Session "${s.title}" deleted.`);
    res.json({ success: true });
  } catch (e) {
    console.error("Delete session error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;