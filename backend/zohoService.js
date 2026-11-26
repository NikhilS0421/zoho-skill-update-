const axios = require("axios");
require("dotenv").config();

async function getAccessToken() {
  const response = await axios.post(
    "https://accounts.zoho.com/oauth/v2/token",
    null,
    {
      timeout: 15000,
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      },
    }
  );

  if (!response.data?.access_token) throw new Error("Could not obtain a Zoho access token");
  return response.data.access_token;
}

module.exports = { getAccessToken };