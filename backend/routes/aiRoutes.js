const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const aiRateLimiter = require("../middleware/aiRateLimiter");
const authMiddleware = require("../middleware/authmiddleware");

/**
 * AI Assistant Routes
 * 
 * WHY POST?
 * 1. We need to send post data (title, body, tags) in the request body.
 * 2. This allows the server to engineer the context before sending it to OpenAI.
 * 3. Protected by authMiddleware to ensure only logged-in users use AI credits.
 */

router.post("/help", authMiddleware, aiRateLimiter, aiController.getAIHelp);

module.exports = router;
