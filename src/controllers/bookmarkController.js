const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const toggleBookmark = async (req, res) => {

  try {

    const db = getDB();

    const promptId = new ObjectId(req.params.id);

    const exists = await db.collection("bookmarks").findOne({

      userEmail: req.user.email,

      promptId,

    });

    if (exists) {

      await db.collection("bookmarks").deleteOne({

        _id: exists._id,

      });

      await db.collection("prompts").updateOne(

        {

          _id: promptId,

        },

        {

          $inc: {

            bookmarkCount: -1,

          },

        }

      );

      return res.json({

        success: true,

        message: "Bookmark Removed",

      });

    }

    await db.collection("bookmarks").insertOne({

      promptId,

      userEmail: req.user.email,

      createdAt: new Date(),

    });

    await db.collection("prompts").updateOne(

      {

        _id: promptId,

      },

      {

        $inc: {

          bookmarkCount: 1,

        },

      }

    );

    res.json({

      success: true,

      message: "Bookmarked",

    });

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

const getBookmarks = async (req, res) => {

  try {

    const db = getDB();

    const saved = await db.collection("bookmarks").aggregate([

      {

        $match: {

          userEmail: req.user.email,

        },

      },

      {

        $lookup: {

          from: "prompts",

          localField: "promptId",

          foreignField: "_id",

          as: "prompt",

        },

      },

      {

        $unwind: "$prompt",

      },

      {

        $replaceRoot: {

          newRoot: "$prompt",

        },

      },

      {

        $sort: {

          createdAt: -1,

        },

      },

    ]).toArray();

    res.json({

      success: true,

      saved,

    });

  }

  catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }

};

module.exports = {

  toggleBookmark,

  getBookmarks,

};