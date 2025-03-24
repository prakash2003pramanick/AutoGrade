const express = require('express');
const axios = require('axios');

require('dotenv').config();

const app = express();
const port = 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const TOKEN_URL = process.env.TOKEN_URL;
const AUTH_URL = process.env.AUTH_URL;

// Scopes for accessing Google Classroom
const SCOPES = 'openid profile email https://www.googleapis.com/auth/classroom.courses https://www.googleapis.com/auth/classroom.coursework.me';

// Redirect to Google OAuth
app.get('/auth/google', (req, res) => {
    const authUrl = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent`;
    res.redirect(authUrl);
});

// Handle Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios.post(TOKEN_URL, null, {
            params: {
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            },
        });

        console.log("Auth response", response.data);

        const { access_token, id_token } = response.data;

        // fetch the classromms here
        try {
            const response = await axios.get('https://classroom.googleapis.com/v1/courses', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            var courses = response.data.courses || [];

            console.log("Courses", courses);
            // res.json({ courses });
        } catch (error) {
            console.error('Error fetching courses:', error);
            // res.status(500).json({ error: 'Failed to fetch courses' });
        }

        // fetch google user id
        const googleUserId = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });
      
         console.log("google user id", googleUserId.data); 

        // Filtering classes created by me 
        const myClasses = courses.filter(course => course.ownerId === googleUserId.data.id);
        console.log("My Courses", myClasses);

        res.redirect(`http://localhost:5173?token=200`);
        // res.redirect("localsend(200, { access_token, id_token });
    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});