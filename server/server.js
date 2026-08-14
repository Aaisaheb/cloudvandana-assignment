require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const recordRoutes = require("./routes/records");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

app.get("/", (req, res) => {
  res.send("CloudVandana Assignment API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
