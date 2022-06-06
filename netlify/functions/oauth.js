const { OAuth2Client } = require('google-auth-library');

const oauth2Client = new OAuth2Client({
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET
});

function generateAuthUrl(network, appchain) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    redirect_uri: `https://${network}.oct.network/redirect`,
    scope: [
      'https://www.googleapis.com/auth/compute.readonly', 
      'https://www.googleapis.com/auth/cloud-platform.read-only',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid'
    ],
    include_granted_scopes: true,
    state: `appchain=${appchain}`
  });
}

exports.handler = async (event) => {
  const { appchain, network, method, code } = event.queryStringParameters;

  let res;

  switch (method) {
    case 'getAuthUrl':
      res = {
        url: generateAuthUrl(network, appchain)
      }
      break;
    case 'getToken':
      res = {
        token: await oauth2Client.getToken(code)
      }
      break;
  }
  
  return {
    statusCode: res ? 200 : 404,
    body: res ? JSON.stringify(res) : null,
  }
}