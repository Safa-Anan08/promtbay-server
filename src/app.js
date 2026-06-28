const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const promptRoutes = require("./routes/promptRoutes");
const copyRoutes = require("./routes/copyRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userDashboardRoutes = require("./routes/userDashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/review.routes");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.log("DB CONNECT ERROR:", err);

    return res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/copies", copyRoutes);
app.use("/api/user-dashboard", userDashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews",reviewRoutes);

module.exports = app;