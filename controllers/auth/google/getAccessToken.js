const axios = require('axios')
const User = require('./../../../models/user')
const getAccessToken = async (req, res) => {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    const AUTH_URL = process.env.GOOGLE_AUTH_URL;
    try {
        const code = req.query.code;
        const tokenResponse = await axios.post(TOKEN_URL, null, {
            params: {
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            },
        });
        console.log("Token Response", tokenResponse.data);
        const { access_token } = tokenResponse.data;

        const newUser = new User({
            google: {
                access_token,
            },
        });
        newUser.save();

    } catch (error) {
        console.error("Error refreshing access token", error.response?.data || error.message);
    }
}

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
                grant_type: 'refresh_token',
            },
        });

        console.log("Token Response", tokenResponse.data);
        const { access_token, expires_in } = tokenResponse.data;

        return { access_token, expires_in };

    } catch (error) {
        console.error("Error refreshing access token", error.response?.data || error.message);
    }
};

const redirectGoogleLogin = async (req, res) => {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    const AUTH_URL = process.env.GOOGLE_AUTH_URL;

    const SCOPES = encodeURIComponent([
        'openid profile email',
        'https://www.googleapis.com/auth/classroom.courses',
        'https://www.googleapis.com/auth/classroom.coursework.me',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.courseworkmaterials',
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.rosters',
        'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
        'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
        'https://www.googleapis.com/auth/classroom.topics',
        'https://www.googleapis.com/auth/classroom.topics.readonly',
        'https://www.googleapis.com/auth/classroom.profile.emails',
        'https://www.googleapis.com/auth/forms.body',
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
      ].join(' '));

    const url = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent`
    res.redirect(url);
}

module.exports = { getAccessToken, refreshAccessToken, redirectGoogleLogin };