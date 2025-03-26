const axios = require('axios')
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

module.exports = { getAccessToken, refreshAccessToken };