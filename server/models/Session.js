const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  menteeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // example: 2026-12-25
  time: { type: String, required: true }, // example: 14:30
  description: { type: String, default: "" },
  attendance: { type: String, enum: ["not marked", "attended", "missed"], default: "not marked" },
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
});

module.exports = mongoose.model("Session", sessionSchema);
