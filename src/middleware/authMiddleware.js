const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const { getDB } = require("../config/db");

const protect = async (
  req,
  res,
  next
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const db = getDB();

    const user =
      await db.collection("users").findOne({
        _id: new ObjectId(decoded.id),
      });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    delete user.password;

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = protect;