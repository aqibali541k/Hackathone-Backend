const jwt = require("jsonwebtoken");
require("dotenv").config();
const { JWT_KEY } = process.env;

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ msg: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Token missing" });

    jwt.verify(token, JWT_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ msg: "Invalid token" });

        // Check if user role is admin
        if (decoded.role !== "ngo") {
            return res.status(403).json({ msg: "Access denied, ngo only" });
        }

        req.user = decoded; // Attach user info
        next();
    });
};

module.exports = verifyAdmin;
