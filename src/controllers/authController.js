const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

const generateToken = require("../utils/generateToken");
const { getDB } = require("../config/db");

const registerUser = async (req, res) => {
  try {
    const db = getDB();

    const { name, email, password, role,imgUrl } =
      req.body;

    const existingUser =
      await db.collection("users").findOne({
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

await db.collection("users").insertOne({
  name,
  email,
  password: hashedPassword,
  role,
  imgUrl:imgUrl || "",

  avatar: "",
  bio: "",
  profession: "",
  skills: "",
  resume: "",

  status: "active",
  createdAt: new Date(),

    plan: "free",
  subscriptionStatus: "inactive",
});

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const db = getDB();

    const { email, password } = req.body;

    const user =
      await db.collection("users").findOne({
        email,
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const matched =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!matched) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMe =
async(
req,
res
)=>{

res.json({

success:true,

user:
req.user,

});

};

const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};