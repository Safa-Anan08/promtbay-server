const { getDB } = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const db = getDB();

    const email = req.user.email;

   

    const copied = await db.collection("copies").aggregate([
      {
        $match: {
          userEmail: email,
        },
      },
      {
        $addFields: {
          promptObjectId: {
            $toObjectId: "$promptId",
          },
        },
      },
      {
        $lookup: {
          from: "prompts",
          localField: "promptObjectId",
          foreignField: "_id",
          as: "prompt",
        },
      },
      {
        $unwind: {
          path: "$prompt",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]).toArray();


    const bookmarks = await db.collection("bookmarks").aggregate([
      {
        $match: {
          userEmail: email,
        },
      },
      {
        $addFields: {
          promptObjectId: {
            $toObjectId: "$promptId",
          },
        },
      },
      {
        $lookup: {
          from: "prompts",
          localField: "promptObjectId",
          foreignField: "_id",
          as: "prompt",
        },
      },
      {
        $unwind: {
          path: "$prompt",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]).toArray();

const reviews = await db
  .collection("reviews")
  .aggregate([
    {
      $match: {
        userEmail: email,
      },
    },
    {
      $addFields: {
        promptObjectId: {
          $toObjectId: "$promptId",
        },
      },
    },
    {
      $lookup: {
        from: "prompts",
        localField: "promptObjectId",
        foreignField: "_id",
        as: "prompt",
      },
    },
    {
      $unwind: {
        path: "$prompt",
        preserveNullAndEmptyArrays: true,
      },
    },
  ])
  .toArray();
   
    let topPrompt = null;

    if (copied.length) {
      topPrompt = copied
        .map((i) => i.prompt)
        .filter(Boolean)
        .sort(
          (a, b) =>
            (b.copyCount || 0) - (a.copyCount || 0)
        )[0];
    }

    res.json({
      totalCopies: copied.length,
      totalBookmarks: bookmarks.length,
      totalReviews: reviews.length,
      topPrompt,
      copiedPrompts: copied,
      bookmarkedPrompts: bookmarks,
      reviews,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};