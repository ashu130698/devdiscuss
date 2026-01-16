const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    if (!req || !req.headers) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({error: "Invalid token"});
    }
};
