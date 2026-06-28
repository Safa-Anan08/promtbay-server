const bcrypt = require("bcryptjs");

const {
  getDB,
} = require("../config/db");

const cloudinary =
require("../config/cloudinary");

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const db = getDB();

    const result =
      await new Promise((resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "avatars",
            },
            (error, uploaded) => {
              if (error) {
                reject(error);
              } else {
                resolve(uploaded);
              }
            }
          );

        stream.end(req.file.buffer);
      });

    await db.collection("users").updateOne(
      {
        email: req.user.email,
      },
      {
        $set: {
          imgUrl: result.secure_url,
          avatar: result.secure_url,
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

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {

  try {

    const db = getDB();

    const user =
      await db
        .collection("users")
        .findOne(
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

    res.json({

      success: true,

      user: {

        ...user,

        subscription:
          user.subscription || {

            plan: "free",
            status: "inactive",

          },

      },

    });

  }

  catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};


const updateProfile = async (req, res) => {

  try {

    const db = getDB();

    const updateData = {

      updatedAt: new Date(),

    };

    if (req.body.name)
      updateData.name =
        req.body.name;

    if (req.body.bio)
      updateData.bio =
        req.body.bio;

    if (req.body.profession)
      updateData.profession =
        req.body.profession;

    if (req.body.skills)
      updateData.skills =
        req.body.skills;

    if (req.body.imgUrl)
      updateData.imgUrl =
        req.body.imgUrl;

    await db
      .collection("users")
      .updateOne(
        {
          email: req.user.email,
        },
        {
          $set: updateData,
        }
      );

    const updatedUser =
      await db
        .collection("users")
        .findOne(
          {
            email: req.user.email,
          },
          {
            projection: {
              password: 0,
            },
          }
        );

    res.status(200).json({

      success: true,
      message: "Profile Updated",
      user: updatedUser,

    });

  }

  catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};



const updatePassword = async (req, res) => {

  try {

    const db = getDB();

    const user =
      await db
        .collection("users")
        .findOne({
          email: req.user.email,
        });

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    const matched =
      await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

    if (!matched) {

      return res.status(400).json({
        message:
          "Current password incorrect",
      });

    }

    const hashedPassword =
      await bcrypt.hash(
        req.body.newPassword,
        10
      );

    await db
      .collection("users")
      .updateOne(
        {
          email: req.user.email,
        },
        {
          $set: {
            password:
              hashedPassword,
            updatedAt:
              new Date(),
          },
        }
      );

    res.status(200).json({

      success: true,
      message:
        "Password Updated",

    });

  }

  catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }

};


module.exports = {

  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,

};