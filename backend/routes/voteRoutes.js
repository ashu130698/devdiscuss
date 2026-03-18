const express = require("express");
const router = express.Router();
const {
  castVote,
  getVotes,
  getBulkVotes,
} = require("../controllers/voteController");
const authmiddleware = require("../middleware/authmiddleware");
const jwt = require("jsonwebtoken");

/**
 * OPTIONAL AUTH MIDDLEWARE
 * 
 * Why? For public lists (like Posts), we want to show 
 * the total score for everyone, but also highlight 
 * if the CURRENT logged-in user has voted.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // If no token, just continue (req.user remains undefined)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    // If token is valid, attach user to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // If token is invalid, just continue as guest
    next();
  }
};

// ==========================================
// VOTE ROUTES
// ==========================================

// GET /votes/bulk?ids=1,2,3 - Get scores for many posts (Public)
router.get("/bulk", optionalAuth, getBulkVotes);

// GET /votes/:id - Get score for one post (Public)
router.get("/:id", optionalAuth, getVotes);

// POST /votes/:id - Cast/Toggle a vote (Requires Login)
router.post("/:id", authmiddleware, castVote);

module.exports = router;
