const express = require("express");
const router = express.Router();
const Session = require("../models/Session");

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const templatesForTitle = [
  {
    titleTpl: (s) => s,
    descTpl: (s) =>
      `Intro (5m): objectives and warm-up. Main practice (30m): focused drills on ${s}. Cool-down (10m): reflection and notes.`,
  },
  {
    titleTpl: (s) => s,
    descTpl: (s) =>
      `Warm-up (10m). Technique focus (25m) working specifically on ${s}. Small games/drills (15m). Wrap-up (10m).`,
  },
  {
    titleTpl: (s) => s,
    descTpl: (s) =>
      `Quick skill check (5m). Guided practice (20m) centered on ${s}. Partner feedback (15m). Short challenge (15m). Review (5m).`,
  },
  {
    titleTpl: (s) => s,
    descTpl: (s) =>
      `Goal setting (5m), demonstration (10m), repeated practice rounds (3 x 12m) focusing on ${s}, final recap (6m).`,
  },
];

const followupTemplates = [
  {
    titleTpl: (s) => `Follow-up: ${s}`,
    descTpl: (s) =>
      `Based on "${s}", try this: warm-up (10m), focused practice (30m), cool-down (10m).`,
  },
  {
    titleTpl: (s) => `${s} - Beginner Drill`,
    descTpl: (s) =>
      `A beginner-friendly follow-up to "${s}": intro (5m), demo (15m), guided practice (25m), recap (10m).`,
  },
  {
    titleTpl: (s) => `Practice: ${s}`,
    descTpl: (s) =>
      `Practice plan for "${s}": short warm-up (5m), three focused exercises (3 × 10m), short review (5m).`,
  },
];

router.get("/suggest", async (req, res) => {
  try {
    const raw = (req.query.title || "").trim();
    if (raw) {
      const tpl = pick(templatesForTitle);
      const title = tpl.titleTpl(raw);
      const description = tpl.descTpl(raw);
      return res.json({ suggestion: { title, description } });
    }

    const recent = await Session.find({}).sort({ createdAt: -1 }).limit(6);
    if (recent && recent.length) {
      const source = recent[0].title || "New session idea";
      const tpl = pick(followupTemplates);
      const title = tpl.titleTpl(source);
      const description = tpl.descTpl(source);
      return res.json({ suggestion: { title, description } });
    }

    res.json({
      suggestion: {
        title: "New session idea",
        description:
          "Try: warm-up (10m), focused practice (30m), cool-down (10m).",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;