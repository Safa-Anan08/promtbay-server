const express = require("express");

const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} = require("../controllers/authController");

const {
  googleLogin,
} = require("../controllers/googleAuthController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post(
  "/google",
  googleLogin
);

router.get(
  "/me",
  protect,
  getMe
);

router.post(
  "/logout",
  logoutUser
);

module.exports = router;