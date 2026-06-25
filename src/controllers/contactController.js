const { getDB } = require("../config/db");

const { ObjectId } = require("mongodb");

const sendMessage = async (req, res) => {
  try {
    const db = getDB();

    const {
      name,
      email,
      message,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    await db.collection("messages").insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
      status: "unread",
    });

    res.json({
      success: true,
      message: "Sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const db = getDB();

    const messages = await db
      .collection("messages")
      .find()
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("messages").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({
      success: true,
      message: "Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("messages").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          status: "read",
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

module.exports = {
  sendMessage,
  getMessages,
  deleteMessage,
  markAsRead,
};