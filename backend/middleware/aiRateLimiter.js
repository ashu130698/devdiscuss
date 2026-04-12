const rateLimit = require("express-rate-limit");

/**
 * AI API Rate Limiter
 * 
 * WHY? 
 * 1. AI APIs (like OpenAI) cost real money.
 * 2. It's easy for someone to abuse these endpoints and 
 *    drain your credits.
 * 3. Rate limiting protects your budget and your server 
 *    from being overwhelmed.
 */

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per window
  message: {
    error: "Too many AI requests. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = aiRateLimiter;
