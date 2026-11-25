const express = require("express");
const MentorProfile = require("../models/MentorProfile");
const User = require("../models/User");

const router = express.Router();

// Turns "Biology, Physics" into ["Biology", "Physics"]
function makeList(text) {
  if (!text) {
    return [];
  }
  if (Array.isArray(text)) {
    return text;
  }
  const parts = text.split(",");
  const list = [];
  for (let i = 0; i < parts.length; i++) {
    const item = parts[i].trim();
    if (item !== "") {
      list.push(item);
    }
  }
  return list;
}

// GET /api/mentors
// Optional: /api/mentors?interests=biology,physics  (shows only matching mentors)
router.get("/", async (req, res) => {
  try {
    const allProfiles = await MentorProfile.find().populate("userId", "name email");

    // Remove profiles whose user no longer exists
    const profiles = [];
    for (let i = 0; i < allProfiles.length; i++) {
      if (allProfiles[i].userId) {
        profiles.push(allProfiles[i]);
      }
    }

    // Read the interests from the URL
    let interests = [];
    if (req.query.interests) {
      const parts = req.query.interests.split(",");
      for (let i = 0; i < parts.length; i++) {
        const item = parts[i].trim().toLowerCase();
        if (item !== "") {
          interests.push(item);
        }
      }
    }

    // No interests given: return every mentor
    if (interests.length === 0) {
      return res.json(profiles);
    }

    // Basic matching: a mentor matches if any expertise and any interest
    // share the same words (for example "Biology" and "Marine Biology")
    const matchingProfiles = [];
    for (let i = 0; i < profiles.length; i++) {
      const expertiseList = profiles[i].expertise;
      let isMatch = false;

      for (let j = 0; j < expertiseList.length; j++) {
        const expertise = expertiseList[j].toLowerCase();
        for (let k = 0; k < interests.length; k++) {
          if (expertise.includes(interests[k]) || interests[k].includes(expertise)) {
            isMatch = true;
          }
        }
      }

      if (isMatch) {
        matchingProfiles.push(profiles[i]);
      }
    }

    res.json(matchingProfiles);
  } catch (error) {
    res.status(500).json({ message: "Server error while loading mentors" });
  }
});

// GET /api/mentors/:userId  (one mentor's own profile, or null if none yet)
router.get("/:userId", async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ userId: req.params.userId });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error while loading profile" });
  }
});

// PUT /api/mentors/:userId  (creates the profile or updates it)
router.put("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || user.role !== "mentor") {
      return res.status(400).json({ message: "Only mentors can have a profile" });
    }

    const { expertise, experience, bio } = req.body;

    const profile = await MentorProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { expertise: makeList(expertise), experience: experience, bio: bio },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error while saving profile" });
  }
});

module.exports = router;
