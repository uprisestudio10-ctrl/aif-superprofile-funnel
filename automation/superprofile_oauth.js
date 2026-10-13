const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

const CLIENT_ID = 'fRQfOYfdQG2jpKiFzWj0Y-qX6vVgglnjV2p8FH1XG2E';
const REDIRECT_URI = 'http://localhost:8080/callback';
const RESOURCE = 'https://mcp.superprofile.bio/mcp';

function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

const code_verifier = base64URLEncode(crypto.randomBytes(32));
const code_challenge = base64URLEncode(sha256(code_verifier));
const state = base64URLEncode(crypto.randomBytes(16));

fs.writeFileSync('automation/.sp_verifier.json', JSON.stringify({ code_verifier, state, client_id: CLIENT_ID }));

const scopes = [
  'webinars:read',
  'webinars:write',
  'webinars:connections:write',
  'webinars:customers:read',
  'webinars:email:read',
  'webinars:email:write',
  'courses:read',
  'courses:write',
  'courses:customers:read',
  'integrations:read',
  'integrations:write',
  'products:read',
  'products:write',
  'product_store:read',
  'product_store:write',
  'analytics:read'
].join(' ');

const authUrl = `https://mcp.superprofile.bio/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&code_challenge=${code_challenge}&code_challenge_method=S256&state=${state}&resource=${encodeURIComponent(RESOURCE)}`;

console.log('AUTHORIZATION_URL:' + authUrl);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:8080');
  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');

    if (code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Superprofile Connected Successfully with All Scopes!</h1><p>You can close this tab and return to the editor.</p>');
      
      console.log('AUTH_CODE_RECEIVED:' + code);
      
      try {
        const tokenRes = await fetch('https://mcp.superprofile.bio/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: code_verifier,
            resource: RESOURCE
          }).toString()
        });
        
        const tokenData = await tokenRes.json();
        console.log('ALL_SCOPES_TOKEN_RECEIVED:', JSON.stringify(tokenData));
        fs.writeFileSync('automation/.sp_token.json', JSON.stringify(tokenData, null, 2));
      } catch (err) {
        console.error('Failed to exchange token:', err);
      }
      
      setTimeout(() => process.exit(0), 1000);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Error or cancelled');
    }
  }
});

server.listen(8080, () => {
  console.log('Listening on port 8080...');
});
