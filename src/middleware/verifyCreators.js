const { getDB } = require("../config/db");

const verifyCreators = async (req, res, next) => {

  try {

    const db = getDB();

    const user = await db.collection("users").findOne({

      email: req.user.email,

    });

    if (!user || (user.role !== "creator" && user.role !== "admin")) {

      return res.status(403).json({

        success: false,
        message: "Creator access only",

      });

    }

    next();

  }

  catch (error) {

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};

module.exports = verifyCreators;