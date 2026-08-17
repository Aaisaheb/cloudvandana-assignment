require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const recordRoutes = require("./routes/records");

const app = express();
const clientDistPath = path.join(__dirname, "../client/dist");

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      // set secure:true once deployed behind HTTPS
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
  })
);

app.use("/auth", authRoutes);
app.use("/api", recordRoutes);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "CloudVandana Assignment API is running." });
});

app.get("/", (req, res, next) => {
  if (fs.existsSync(path.join(clientDistPath, "index.html"))) {
    return res.sendFile(path.join(clientDistPath, "index.html"));
  }
  res.send("CloudVandana Assignment API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
