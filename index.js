const express = require('express');
const axios = require('axios');
const formRoutes = require('./routes/form')

require('dotenv').config();

const app = express();

app.use(express.json()); 

const port = 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const TOKEN_URL = process.env.TOKEN_URL;
const AUTH_URL = process.env.AUTH_URL;

console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", CLIENT_SECRET ? "Loaded" : "Not Loaded");
console.log("REDIRECT_URI:", REDIRECT_URI);



const SCOPES = [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/classroom.courses.readonly', // Read courses
    'https://www.googleapis.com/auth/classroom.coursework.students', // Create and manage coursework
    'https://www.googleapis.com/auth/classroom.rosters.readonly', 
   ' https://www.googleapis.com/auth/forms.body', 
     'https://www.googleapis.com/auth/drive.file', 
     'https://www.googleapis.com/auth/classroom.courses',
     'https://www.googleapis.com/auth/classroom.coursework.me',
     'https://www.googleapis.com/auth/classroom.coursework.students',
     'https://www.googleapis.com/auth/classroom.announcements',
     'https://www.googleapis.com/auth/classroom.rosters',
     'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
     'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
     'https://www.googleapis.com/auth/classroom.topics',
     'https://www.googleapis.com/auth/classroom.topics.readonly',
     'https://www.googleapis.com/auth/classroom.profile.emails',
     "https://www.googleapis.com/auth/drive"
  ].join(' ');


//   const SCOPES = encodeURIComponent([
//     'openid profile email',
//     'https://www.googleapis.com/auth/classroom.courses',
//     'https://www.googleapis.com/auth/classroom.coursework.me',
//     'https://www.googleapis.com/auth/classroom.coursework.students',
//     'https://www.googleapis.com/auth/classroom.courseworkmaterials',
//     'https://www.googleapis.com/auth/classroom.announcements',
//     'https://www.googleapis.com/auth/classroom.rosters',
//     'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
//     'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
//     'https://www.googleapis.com/auth/classroom.topics',
//     'https://www.googleapis.com/auth/classroom.topics.readonly',
//     'https://www.googleapis.com/auth/classroom.profile.emails',
//     'https://www.googleapis.com/auth/forms.body',
//     "https://www.googleapis.com/auth/drive",
//     "https://www.googleapis.com/auth/drive.file",
//   ].join(' '));


// Redirect to Google OAuth
app.get('/auth/google', (req, res) => {
    const authUrl = new URL(AUTH_URL);
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
  
    res.redirect(authUrl.toString());
  });

// Handle Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
  
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
  
    try {
      // Exchange authorization code for tokens
      const tokenResponse = await axios.post(TOKEN_URL, null, {
        params: {
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      const { 
        access_token, 
        refresh_token, 
        expires_in, 
        id_token 
      } = tokenResponse.data;
  
      // Verify the tokens (optional but recommended)
      const userInfoResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
      );
  
      // Redirect with tokens and user info
      const redirectUrl = new URL('http://localhost:5173');
      redirectUrl.searchParams.set('access_token', access_token);
      console.log(access_token);
      // redirectUrl.searchParams.set('refresh_token', refresh_token);
      // redirectUrl.searchParams.set('email', userInfoResponse.data.email);
      
      res.redirect(redirectUrl.toString());
  
    } catch (error) {
      console.error('OAuth Error:', error.response ? error.response.data : error.message);
      
      // More detailed error handling
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Authentication failed',
          details: error.response.data
        });
      }
      
      res.status(500).json({ 
        error: 'Internal server error during authentication',
        message: error.message 
      });
    }
  });

app.use('/form', formRoutes)




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});