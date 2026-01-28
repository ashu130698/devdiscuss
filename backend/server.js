const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/postRoutes");
const answerRoutes = require("./routes/answerRoutes");
const authMiddleware = require("./middleware/authmiddleware");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/posts", answerRoutes);

app.use("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    userId: req.user.userId,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.send("ok");
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error", err));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
