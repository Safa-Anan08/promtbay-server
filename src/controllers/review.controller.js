const { getDB } = require("../config/db");

const getReviews = async (req, res) => {
  try {
    const db = getDB();

    const reviews = await db
      .collection("reviews")
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(12)
      .toArray();

    res.json({
      reviews,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getReviews,
};