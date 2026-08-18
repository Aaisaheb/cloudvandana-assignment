require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const recordRoutes = require("./routes/records");

const app = express();

// --------------------------------------------------
// Paths
// --------------------------------------------------
const clientDistPath = path.join(__dirname, "../client/dist");

// --------------------------------------------------
// Render / Reverse Proxy
// --------------------------------------------------
// Render terminates HTTPS at its proxy and forwards
// the request to Node over HTTP.
// This allows secure session cookies to work correctly.
app.set("trust proxy", 1);

// --------------------------------------------------
// Middleware
// --------------------------------------------------
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);

// --------------------------------------------------
// Session
// --------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cloudvandana-session-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      // HTTPS on Render
      secure: process.env.NODE_ENV === "production",

      // Allows OAuth redirect/callback
      sameSite: "lax",

      // 8 hours
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

// --------------------------------------------------
// Routes
// --------------------------------------------------
app.use("/auth", authRoutes);

app.use("/api", recordRoutes);

// --------------------------------------------------
// Serve React production build
// --------------------------------------------------
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// --------------------------------------------------
// Health check
// --------------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "CloudVandana Assignment API is running."
  });
});

// --------------------------------------------------
// Root
// --------------------------------------------------
app.get("/", (req, res) => {
  const indexPath = path.join(clientDistPath, "index.html");

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.send("CloudVandana Assignment API is running.");
});

// --------------------------------------------------
// Port
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});