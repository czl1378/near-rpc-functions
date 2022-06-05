const { OAuth2Client } = require('google-auth-library');

exports.handler = async (event) => {
  const { appchain } = event.queryStringParameters;

  const oauth2Client = new OAuth2Client({
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    redirectUri: `https://${process.env.NETWORK_ID}.oct.network/callback`
  });

  const url = oauth2Client.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/compute.readonly', 
      'https://www.googleapis.com/auth/cloud-platform.read-only',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid'
    ],
    state: `appchain=${appchain}`
  });
  
  return {
    statusCode: 200,
    body: url,
  }
}