const axios = require("axios");

// Wraps a Salesforce REST call. If the access token has expired (401),
// it silently refreshes using the stored refresh_token and retries once.
async function sfRequest(req, { method, path, data, params }) {
  const auth = req.session.sfAuth;
  if (!auth) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }

  const doCall = (token, instanceUrl) =>
    axios({
      method,
      url: `${instanceUrl}${path}`,
      data,
      params,
      headers: { Authorization: `Bearer ${token}` }
    });

  try {
    const resp = await doCall(auth.access_token, auth.instance_url);
    return resp.data;
  } catch (err) {
    const isExpired = err.response?.status === 401;
    if (isExpired && auth.refresh_token) {
      const refreshed = await axios.post(
        `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: auth.refresh_token,
          client_id: process.env.SF_CLIENT_ID,
          client_secret: process.env.SF_CLIENT_SECRET
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      req.session.sfAuth.access_token = refreshed.data.access_token;
      const retry = await doCall(refreshed.data.access_token, auth.instance_url);
      return retry.data;
    }
    throw err;
  }
}

module.exports = { sfRequest };
