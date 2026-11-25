const express = require("express");
const bcrypt = require("bcryptjs");
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

// We never send the password back to the frontend
function makeSafeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, interests } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    if (role !== "mentor" && role !== "mentee") {
      return res.status(400).json({ message: "Role must be mentor or mentee" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    // Save the password in a scrambled (hashed) form
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      interests: makeList(interests),
    });

    res.status(201).json(makeSafeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Server error while registering" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json(makeSafeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Server error while logging in" });
  }
});

module.exports = router;
