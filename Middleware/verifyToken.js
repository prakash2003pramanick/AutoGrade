const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { refreshAccessToken } = require("../controllers/auth/google/getAccessToken");

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

    const refreshToken = await refreshAccessToken(
      verifiedUser.google.refresh_token
    );

    let newUser;

    if (refreshToken) {
      verifiedUser.google.access_token = refreshToken.access_token;
      verifiedUser.markModified('google.access_token');
      newUser = await verifiedUser.save();

    }
    if (!newUser) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = newUser;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyToken;