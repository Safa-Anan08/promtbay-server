const { OAuth2Client } = require("google-auth-library");
const { getDB } = require("../config/db");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Credential missing",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const db = getDB();

    let user = await db.collection("users").findOne({
      email: payload.email,
    });

    if (!user) {
      const newUser = {
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        imgUrl: payload.picture,
        role: "user",
        plan: "free",
        subscriptionStatus: "inactive",
        subscription: {
          plan: "free",
          status: "inactive",
        },
        bio: "",
        profession: "",
        skills: "",
        status: "active",
        createdAt: new Date(),
      };

      const result = await db.collection("users").insertOne(newUser);

      user = {
        _id: result.insertedId,
        ...newUser,
      };
    } else {
      const update = {};

      if (!user.role) update.role = "user";

      if (!user.subscription) {
        update.subscription = {
          plan: "free",
          status: "inactive",
        };
      }

      if (!user.plan) update.plan = "free";

      if (!user.subscriptionStatus) {
        update.subscriptionStatus = "inactive";
      }

      if (Object.keys(update).length) {
        await db.collection("users").updateOne(
          {
            email: payload.email,
          },
          {
            $set: update,
          }
        );

        user = {
          ...user,
          ...update,
        };
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err.response?.data);
    console.log(err.message);
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  googleLogin,
};