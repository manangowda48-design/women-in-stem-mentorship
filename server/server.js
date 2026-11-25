const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const mentorRoutes = require("./routes/mentors");
const requestRoutes = require("./routes/requests");
const sessionRoutes = require("./routes/sessions");
const feedbackRoutes = require("./routes/feedback");

const app = express();

// Allow the React app to call this server
app.use(cors());

// Allow the server to read JSON sent from the frontend
app.use(express.json());

// Connect to MongoDB (database name: women_in_stem)
// If you use MongoDB Atlas, replace this text with your own connection string
mongoose
  .connect("mongodb://127.0.0.1:27017/women_in_stem")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// A simple test route to check that the server works
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// All the API routes
app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/feedback", feedbackRoutes);

// Start the server on port 5000
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
