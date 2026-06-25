const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const copyPrompt = async (req, res) => {
  try {
    const db = getDB();

    const promptId = new ObjectId(req.params.id);

   
    const prompt = await db.collection("prompts").findOne({
      _id: promptId,
    });

    if (!prompt) {
      return res.status(404).json({
        message: "Prompt not found",
      });
    }

    const exists = await db.collection("copies").findOne({
      promptId,
      userEmail: req.user.email,
    });

    if (exists) {
      return res.json({
        success: true,
        message: "Already copied",
      });
    }


    await db.collection("copies").insertOne({
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
          copyCount: 1,
        },
      }
    );

    const updatedPrompt = await db.collection("prompts").findOne({
      _id: promptId,
    });

    res.json({
      success: true,
      message: "Prompt copied successfully",
      copyCount: updatedPrompt.copyCount,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getCopiedPrompts = async (req, res) => {
  try {
    const db = getDB();

    const copied = await db
      .collection("copies")
      .aggregate([
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
      ])
      .toArray();

    res.json({
      success: true,
      copied,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  copyPrompt,
  getCopiedPrompts,
};