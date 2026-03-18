/**
 * DevDiscuss Backend Server
 * 
 * KEY CONCEPT: Database-First Initialization
 * 
 * WHY? The server should only accept requests AFTER 
 * the database is ready. This prevents:
 * - Race conditions
 * - Failed early requests
 * - Confusing error messages for users
 * 
 * INTERVIEW TIP: This pattern shows you understand
 * asynchronous initialization and error handling.
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/postRoutes");
const answerRoutes = require("./routes/answerRoutes");
const voteRoutes = require("./routes/voteRoutes");
const authMiddleware = require("./middleware/authmiddleware");

// ==========================================
// EXPRESS APP SETUP
// ==========================================
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
app.use("/votes", voteRoutes);

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

// ==========================================
// DATABASE-FIRST INITIALIZATION
// ==========================================
/**
 * startServer() - Async function to initialize app properly
 * 
 * PATTERN: Connect to DB first, then start Express
 * 
 * WHY async/await instead of .then()?
 * - Cleaner, more readable code
 * - Easier error handling with try/catch
 * - Industry standard for modern Node.js
 */
const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB FIRST
    // WHY: We wait here until MongoDB is fully connected
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Step 2: ONLY THEN start the Express server
    // WHY: Now we're guaranteed DB is ready for requests
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    // If MongoDB fails to connect, don't start server
    // WHY: No point running a server that can't access data
    console.error("❌ Failed to start server:", error.message);
    
    // Exit with error code 1 (indicates failure)
    // WHY: This tells process managers (PM2, Docker) to restart
    process.exit(1);
  }
};

// ==========================================
// GRACEFUL SHUTDOWN HANDLING
// ==========================================
/**
 * WHY HANDLE SHUTDOWN?
 * - Prevents data corruption during deploys
 * - Cleanly closes database connections
 * - Professional production practice
 * 
 * INTERVIEW TIP: This shows you understand
 * production deployment concerns.
 */

// Handle SIGINT (Ctrl+C in terminal)
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("📦 MongoDB connection closed");
  process.exit(0);
});

// Handle SIGTERM (deployment/container shutdown)
process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received, shutting down...");
  await mongoose.connection.close();
  console.log("📦 MongoDB connection closed");
  process.exit(0);
});

// Start the application
startServer();
