const jwt = require("jsonwebtoken");

/**
 * AUTH MIDDLEWARE
 * 
 * This middleware verifies the JWT token sent in the Authorization header.
 * It's used to protect routes that require a logged-in user.
 */
module.exports = function (req, res, next) {
    // If we're coming from optionalAuth and already have req.user, just continue
    if (req.user !== undefined) {
        return next();
    }

    const authHeader = req.headers.authorization;

    // Check if token exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token using secret from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user data to request object
        // This makes req.user.userId available in controllers
        req.user = decoded;
        
        next();
    } catch (err) {
        // Token is expired or forged
        return res.status(401).json({ error: "Invalid token" });
    }
};
