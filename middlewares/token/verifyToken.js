const jwt = require("jsonwebtoken");
require("dotenv").config();
const { JWT_KEY } = process.env;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // console.log("authHeader: ", authHeader)

  if (!authHeader) return res.status(401).json({ msg: "No token provided" });

  //
  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "token missing" });
  // console.log(token)

  // verify the token
  jwt.verify(token, JWT_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "invalid token" });

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
