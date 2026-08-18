const express = require("express");
const axios = require("axios");
const router = express.Router();

// Step 1: kick off the OAuth 2.0 Web Server Flow by redirecting the
// user to Salesforce's authorize endpoint.
router.get("/login", (req, res) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SF_CLIENT_ID,
    redirect_uri: process.env.SF_REDIRECT_URI,
    scope: "api refresh_token offline_access"
  });
  
  console.log("[auth/login] building authorize URL", {
    client_id: process.env.SF_CLIENT_ID,
    redirect_uri: process.env.SF_REDIRECT_URI,
    sf_login_url: process.env.SF_LOGIN_URL
  });

  const authUrl = `${process.env.SF_LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;
  res.redirect(authUrl);
});

// Step 2: Salesforce redirects back here with a one-time "code".
// We exchange it for an access_token + instance_url and store both
// in the server-side session (cookie-based).
router.get("/callback", async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    console.error("OAuth error:", error, error_description);
    return res.redirect(`${process.env.CLIENT_URL}/?auth=error`);
  }

  try {
    console.log("[auth/callback] received callback", { code: Boolean(code) });
    const tokenRes = await axios.post(
      `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        redirect_uri: process.env.SF_REDIRECT_URI
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, instance_url } = tokenRes.data;

    req.session.sfAuth = { access_token, refresh_token, instance_url };
    res.redirect(`${process.env.CLIENT_URL}/?auth=success`);
  } catch (err) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}/?auth=error`);
  }
});

// Lets the frontend check "am I logged in?" on page load.
router.get("/status", (req, res) => {
  const isAuthed = Boolean(req.session.sfAuth?.access_token);
  res.json({ authenticated: isAuthed });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

module.exports = router;
