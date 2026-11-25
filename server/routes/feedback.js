const express = require("express");
const Feedback = require("../models/Feedback");
const Session = require("../models/Session");

const router = express.Router();

// POST /api/feedback  (a mentee gives feedback for a completed session)
router.post("/", async (req, res) => {
  try {
    const { sessionId, menteeId, rating, comments } = req.body;

    if (!sessionId || !menteeId || !rating) {
      return res.status(400).json({ message: "Session and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (String(session.menteeId) !== String(menteeId)) {
      return res.status(400).json({ message: "This is not your session" });
    }
    if (session.status !== "completed") {
      return res.status(400).json({ message: "Feedback is only allowed after a completed session" });
    }

    const existing = await Feedback.findOne({ sessionId: sessionId });
    if (existing) {
      return res.status(400).json({ message: "Feedback was already given for this session" });
    }

    const feedback = await Feedback.create({
      sessionId: sessionId,
      menteeId: menteeId,
      mentorId: session.mentorId,
      rating: rating,
      comments: comments,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error while saving feedback" });
  }
});

// GET /api/feedback/mentor/:mentorId  (feedback received by a mentor)
router.get("/mentor/:mentorId", async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ mentorId: req.params.mentorId })
      .populate("menteeId", "name")
      .populate("sessionId", "date time description");
    res.json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: "Server error while loading feedback" });
  }
});

// GET /api/feedback/mentee/:menteeId  (feedback given by a mentee)
router.get("/mentee/:menteeId", async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ menteeId: req.params.menteeId })
      .populate("mentorId", "name")
      .populate("sessionId", "date time description");
    res.json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: "Server error while loading feedback" });
  }
});

module.exports = router;
