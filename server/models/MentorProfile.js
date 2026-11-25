const mongoose = require("mongoose");

const mentorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expertise: [String],
  experience: { type: String, default: "" },
  bio: { type: String, default: "" },
});

module.exports = mongoose.model("MentorProfile", mentorProfileSchema);
