const jwt = require("jsonwebtoken");
const SECRET_KEY = "dkfbb3kub487egrbiu5938fe9gu34hoehf9284wewoeh94";

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid Token" });
  }
};

module.exports = authenticateToken;
