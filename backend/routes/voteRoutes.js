const express = require("express");
const router = express.Router();
const {
  castVote,
  getVotes,
  getBulkVotes,
} = require("../controllers/voteController");
const authmiddleware = require("../middleware/authmiddleware");

// Optional auth middleware — attaches req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  // Delegate to real auth middleware
  authmiddleware(req, res, next);
};

// Get votes for multiple posts in bulk (optional auth)
router.get("/bulk", optionalAuth, getBulkVotes);

// Cast a vote (requires auth)
router.post("/:id", authmiddleware, castVote);

// Get votes for a single post (optional auth to include userVote)
router.get("/:id", optionalAuth, getVotes);

module.exports = router;
