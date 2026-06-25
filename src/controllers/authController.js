const bcrypt = require("bcryptjs");

const generateToken = require("../utils/generateToken");
const { getDB } = require("../config/db");

const registerUser = async (req, res) => {
  try {
    const db = getDB();

    const { name, email, password, role, imgUrl } = req.body;

    const existingUser = await db.collection("users").findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      imgUrl: imgUrl || "",

      avatar: "",
      bio: "",
      profession: "",
      skills: "",
      resume: "",

      status: "active",

      plan: "free",
      subscriptionStatus: "inactive",

      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const db = getDB();

    const { email, password } = req.body;

    const user = await db.collection("users").findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const matched = await bcrypt.compare(
      password,
      user.password
    );

    if (!matched) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete user.password;

    res.status(200).json({
      success: true,
      user,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};



module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,

};