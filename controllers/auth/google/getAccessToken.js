const axios = require("axios");
const User = require("../../../models/user");
const jwt = require("jsonwebtoken");

const getAccessToken = async (req, res) => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_AUTH_URL,
    JWT_SECRET,
    GOOGLE_TOKEN_URL,
  } = process.env;

  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
    });

    const { access_token, refresh_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { id, email, name, picture, } = userInfoResponse.data;

    let user = await User.findOne({ email: email });

    if (!user) {
      console.log("Creating new user");
      user = new User({
        google: tokenResponse.data,
        email,
        name,
        picture,
      });

    }
    else {
      user.google = tokenResponse.data;
    }
    const newUser = await user.save();

    const jwtToken = jwt.sign({ id: newUser._id }, JWT_SECRET);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth?token=${jwtToken}`;
    console.log("Redirect URL", redirectUrl);
    // Redirect to frontend with JWT token
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error(
      "Error in Google authentication",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const refreshAccessToken = async (refreshToken) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const TOKEN_URL = process.env.GOOGLE_TOKEN_URL;

  try {
    const tokenResponse = await axios.post(TOKEN_URL, null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
    });

    console.log("Token Response", tokenResponse.data);
    const { access_token, expires_in } = tokenResponse.data;

    

    return { access_token, expires_in };
  } catch (error) {
    console.error(
      "Error refreshing access token",
      error.response?.data || error.message
    );
  }
};

const redirectGoogleLogin = async (req, res) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  const AUTH_URL = process.env.GOOGLE_AUTH_URL;

  const SCOPES = encodeURIComponent(
    [
      "openid profile email",
      "https://www.googleapis.com/auth/classroom.courses",
      "https://www.googleapis.com/auth/classroom.coursework.me",
      "https://www.googleapis.com/auth/classroom.coursework.students",
      "https://www.googleapis.com/auth/classroom.courseworkmaterials",
      "https://www.googleapis.com/auth/classroom.announcements",
      "https://www.googleapis.com/auth/classroom.rosters",
      "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
      "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
      "https://www.googleapis.com/auth/classroom.topics",
      "https://www.googleapis.com/auth/classroom.topics.readonly",
      "https://www.googleapis.com/auth/classroom.profile.emails",
      "https://www.googleapis.com/auth/forms.body",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
    ].join(" ")
  );

  const url = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent`;
  res.redirect(url);
};

module.exports = { getAccessToken, refreshAccessToken, redirectGoogleLogin };
