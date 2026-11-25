const express = require("express");
const MentorshipRequest = require("../models/MentorshipRequest");

const router = express.Router();

// POST /api/requests  (a mentee sends a request to a mentor)
router.post("/", async (req, res) => {
  try {
    const { mentorId, menteeId } = req.body;

    if (!mentorId || !menteeId) {
      return res.status(400).json({ message: "mentorId and menteeId are required" });
    }

    // Do not allow a second request while one is pending or accepted
    const existing = await MentorshipRequest.findOne({
      mentorId: mentorId,
      menteeId: menteeId,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      return res.status(400).json({ message: "You already have a request with this mentor" });
    }

    const request = await MentorshipRequest.create({ mentorId, menteeId });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error while sending request" });
  }
});

// GET /api/requests/mentee/:menteeId  (requests sent by one mentee)
router.get("/mentee/:menteeId", async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ menteeId: req.params.menteeId }).populate(
      "mentorId",
      "name email"
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error while loading requests" });
  }
});

// GET /api/requests/mentor/:mentorId  (requests received by one mentor)
router.get("/mentor/:mentorId", async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ mentorId: req.params.mentorId }).populate(
      "menteeId",
      "name email interests"
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error while loading requests" });
  }
});

// PUT /api/requests/:id  (mentor accepts or rejects)
router.put("/:id", async (req, res) => {
  try {
    const status = req.body.status;
    if (status !== "accepted" && status !== "rejected") {
      return res.status(400).json({ message: "Status must be accepted or rejected" });
    }

    const request = await MentorshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error while updating request" });
  }
});

module.exports = router;
