const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class AuthService {
  constructor() {
    this.SCOPES = ['https://www.googleapis.com/auth/forms'];
    this.TOKEN_PATH = path.join(process.cwd(), 'config', 'token.json');
    this.CREDENTIALS_PATH = path.join(process.cwd(), 'config', 'credentials.json');
  }

  async authorize() {
    const credentials = JSON.parse(fs.readFileSync(this.CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      redirect_uris[0]
    );

    // Check if we have a previously stored token
    try {
      const token = JSON.parse(fs.readFileSync(this.TOKEN_PATH));
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    } catch (err) {
      return this.getNewToken(oAuth2Client);
    }
  }

  getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('After authorization, paste the code here:');

    // In a real-world scenario, you'd implement a more robust token retrieval process
    throw new Error('Please generate a new access token manually');
  }
}

module.exports = new AuthService();