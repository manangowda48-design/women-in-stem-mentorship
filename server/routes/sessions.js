const express = require("express");
const Session = require("../models/Session");
const MentorshipRequest = require("../models/MentorshipRequest");

const router = express.Router();

// POST /api/sessions  (schedule a session)
router.post("/", async (req, res) => {
  try {
    const { mentorId, menteeId, date, time, description } = req.body;

    if (!mentorId || !menteeId || !date || !time) {
      return res.status(400).json({ message: "Mentor, mentee, date and time are required" });
    }

    // A session can only be scheduled if the request was accepted
    const acceptedRequest = await MentorshipRequest.findOne({
      mentorId: mentorId,
      menteeId: menteeId,
      status: "accepted",
    });
    if (!acceptedRequest) {
      return res
        .status(400)
        .json({ message: "Sessions can only be scheduled after the mentor accepts the request" });
    }

    const session = await Session.create({ mentorId, menteeId, date, time, description });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error while scheduling session" });
  }
});

// GET /api/sessions/user/:userId  (all sessions of a mentor or a mentee)
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const sessions = await Session.find({
      $or: [{ mentorId: userId }, { menteeId: userId }],
    })
      .populate("mentorId", "name")
      .populate("menteeId", "name")
      .sort({ date: 1, time: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error while loading sessions" });
  }
});

// PUT /api/sessions/:id/cancel  (cancel a session)
router.put("/:id/cancel", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.status !== "scheduled") {
      return res.status(400).json({ message: "Only scheduled sessions can be cancelled" });
    }

    session.status = "cancelled";
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error while cancelling session" });
  }
});

// PUT /api/sessions/:id/attendance  (mark attended or missed)
router.put("/:id/attendance", async (req, res) => {
  try {
    const attendance = req.body.attendance;
    if (attendance !== "attended" && attendance !== "missed") {
      return res.status(400).json({ message: "Attendance must be attended or missed" });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.status === "cancelled") {
      return res.status(400).json({ message: "A cancelled session cannot be marked" });
    }

    session.attendance = attendance;
    session.status = "completed"; // once attendance is marked, the session is completed
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error while marking attendance" });
  }
});

// PUT /api/sessions/:id  (update date, time or description)
router.put("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.status !== "scheduled") {
      return res.status(400).json({ message: "Only scheduled sessions can be updated" });
    }

    const { date, time, description } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    session.date = date;
    session.time = time;
    session.description = description;
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error while updating session" });
  }
});

module.exports = router;
