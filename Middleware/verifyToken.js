const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("decoded", decoded);

    const verifiedUser = await User.findById(decoded?.id).select("-password");

    console.log("verified user", verifiedUser)

    if (!verifiedUser) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyToken;