const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");
const cloudinary = require("../config/cloudinary");

const getAllUsers = async (req, res) => {
  try {
    const db = getDB();

    const users = await db
      .collection("users")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const changeRole = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("users").updateOne(
      {
        email: req.body.email,
      },
      {
        $set: {
          role: req.body.role,
        },
      }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("users").deleteOne({
      email: req.params.email,
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const db = getDB();

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });

    await db.collection("users").updateOne(
      {
        email: req.user.email,
      },
      {
        $set: {
          imgUrl: result.secure_url,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      url: result.secure_url,
      message: "Avatar Uploaded",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const getProfile = async (req, res) => {
  try {
    const db = getDB();

    const user = await db.collection("users").findOne(
      {
        email: req.user.email,
      },
      {
        projection: {
          password: 0,
        },
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("users").updateOne(
      {
        email: req.user.email,
      },
      {
        $set: {
          name: req.body.name,
          imgUrl: req.body.imgUrl,
          bio: req.body.bio,
          profession: req.body.profession,
          skills: req.body.skills,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const db = getDB();

    const user = await db.collection("users").findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const matched = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );

    if (!matched) {
      return res.status(400).json({
        message: "Current password incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      req.body.newPassword,
      10
    );

    await db.collection("users").updateOne(
      {
        email: req.user.email,
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  getAllUsers,
  changeRole,
  deleteUser,
};