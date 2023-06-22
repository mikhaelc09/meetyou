const { google } = require("googleapis");
const env = require("./env.config.js");

const client_id =env("GOOGLE_CLIENT_ID");
const client_secret = env("GOOGLE_CLIENT_SECRET");
const redirect_url = env("GOOGLE_AUTH_REDIRECT_URL");

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_url
);

module.exports = oauth2Client;
