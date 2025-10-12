require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const sessionsRouter = require("./routes/sessions");
const attendanceRouter = require("./routes/attendance");
const aiRouter = require("./routes/ai");

app.use("/api/sessions", sessionsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/ai", aiRouter);

app.get("/api/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/hobby-session-planner"
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Backend listening on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect DB", err);
    process.exit(1);
  });