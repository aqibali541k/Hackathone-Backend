// Simplified admin middleware — runs AFTER verifyToken, so req.user already exists
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Not authenticated" });
  }

  if (req.user.role !== "ngo") {
    return res.status(403).json({ msg: "Access denied, NGO only" });
  }

  next();
};

module.exports = verifyAdmin;
