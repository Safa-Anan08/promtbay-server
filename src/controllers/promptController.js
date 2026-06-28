const { getDB } =require("../config/db");

const cloudinary =require("../config/cloudinary");

const {ObjectId,} =require("mongodb");

const addPrompt = async (req, res) => {
  try {

    if (!req.user?.email) {
      return res.status(401).json({
        message: "Login required",
      });
    }

    const db = getDB();

    console.log("REQ USER =>", req.user);
    console.log("BODY =>", req.body);
    console.log("FILE =>", req.file);

    const user = await db.collection("users").findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !["user", "creator"].includes(
        user?.role
      )
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    const plan =
      user?.subscription?.plan?.toLowerCase() ||
      user?.plan?.toLowerCase() ||
      "free";

    if (plan === "free") {

      const total =
        await db
          .collection("prompts")
          .countDocuments({
            creatorEmail:
              req.user.email,
          });

      if (total >= 3) {
        return res.status(403).json({
          message:
            "Free users can add only 3 prompts",
        });
      }
    }

    let thumbnail = "";

if (req.file) {
  if (req.file.buffer) {
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "prompts",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    thumbnail = upload.secure_url;
  } else if (req.file.path) {
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "prompts",
    });

    thumbnail = upload.secure_url;
  }
}
    const prompt = {

      title:
        req.body.title || "",

      description:
        req.body.description || "",

      content:
        req.body.content || "",

      category:
        req.body.category || "",

      tool:
        req.body.tool || "",

      tags:
        req.body.tags
          ? req.body.tags
              .split(",")
              .map((t) => t.trim())
          : [],

      difficulty:
        req.body.difficulty ||
        "Beginner",

      visibility:
        req.body.visibility ||
        "Public",

      thumbnail,

      creatorEmail:
        req.user.email,

      creatorName:
        user.name ||

        user.displayName ||

        "Anonymous",

      copyCount: 0,

      bookmarkCount: 0,

      reviewCount: 0,

      rating: 0,

      status: "pending",

      createdAt:
        new Date(),
    };

    const result =
      await db
        .collection("prompts")
        .insertOne(prompt);

    return res.status(201).json({

      success: true,

      insertedId:
        result.insertedId,

      message:
        "Prompt Added",

    });

  }

  catch (error) {

    console.log(
      "ADD PROMPT ERROR =>"
    );

    console.log(error);

    console.log(
      error?.message
    );

    console.log(
      error?.stack
    );

    return res.status(500).json({

      success: false,

      message:
        error?.message ||

        "Internal Server Error",

    });

  }
};

const getMyPrompts = async (req, res) => {

  try {

    const db = getDB();

    const prompts = await db
      .collection("prompts")
      .find({
        creatorEmail: req.user.email,
      })
      .toArray();

    res.json({
      success: true,
      prompts,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

const getSinglePrompt = async (req, res) => {

  try {

    const db = getDB();

    const prompt = await db
      .collection("prompts")
      .findOne({
        _id: new ObjectId(req.params.id),
      });

    if (!prompt) {

      return res.status(404).json({
        message: "Prompt not found",
      });

    }

    let canAccess = true;


    if (prompt.visibility === "premium") {

      canAccess = false;

      if (req.user) {

        const user = await db
          .collection("users")
          .findOne({
            email: req.user.email,
          });

        if (
          user?.plan === "premium" ||
          user?.subscriptionStatus === "active"
        ) {

          canAccess = true;

        }

      }

    }

    res.json({
      success: true,
      prompt,
      canAccess,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

const deletePrompt = async (req, res) => {

  try {

    const db = getDB();

    await db.collection("prompts").deleteOne({
      _id: new ObjectId(req.params.id),
      creatorEmail: req.user.email,
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

const updatePrompt = async (req, res) => {

  try {

    const db = getDB();

    const {
      _id,
      creatorEmail,
      creatorName,
      createdAt,
      ...rest
    } = req.body;

    await db.collection("prompts").updateOne(
      {
        _id: new ObjectId(req.params.id),
        creatorEmail: req.user.email,
      },
      {
        $set: {
          ...rest,
          tags: Array.isArray(rest.tags)
            ? rest.tags
            : rest.tags?.split(","),
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "Updated",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};


const getAllPromptsAdmin = async (req, res) => {
  try {
    const db = getDB();

    const {
      page = 1,
      limit = 6,
      search = "",
      status = "all",
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);

    let query = {};

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          creatorEmail: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status !== "all") {
      query.status = status;
    }

    const total = await db
      .collection("prompts")
      .countDocuments(query);

    const prompts = await db
      .collection("prompts")
      .find(query)
      .sort({
        createdAt: -1,
      })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .toArray();

    res.json({
      success: true,
      prompts,

      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage),
        hasNext:
          currentPage <
          Math.ceil(total / perPage),

        hasPrev:
          currentPage > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const approvePrompt = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("prompts").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          status: "approved",
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

const getPromptStats = async (req, res) => {
  try {
    const db = getDB();

    const total = await db.collection("prompts").countDocuments();

    const approved = await db.collection("prompts").countDocuments({
      status: "approved",
    });

    const pending = await db.collection("prompts").countDocuments({
      status: "pending",
    });

    const rejected = await db.collection("prompts").countDocuments({
      status: "rejected",
    });

    res.json({
      success: true,
      stats: {
        total,
        approved,
        pending,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const rejectPrompt = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("prompts").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          status: "rejected",
          rejectionReason: req.body.reason,
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

const getAllPrompts = async (req, res) => {
  try {
    const db = getDB();

    const {
      search,
      category,
      tool,
      difficulty,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {
      status: "approved",
    };

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tool: {
            $regex: search,
            $options: "i",
          },
        },
        {
          tags: {
            $in: [new RegExp(search, "i")],
          },
        },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tool) {
      query.tool = tool;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    let order = {
      createdAt: -1,
    };

    if (sort === "copied") {
      order = {
        copyCount: -1,
      };
    }

    if (sort === "popular") {
      order = {
        rating: -1,
      };
    }

    const currentPage = Number(page);
    const perPage = Number(limit);

    const total = await db
      .collection("prompts")
      .countDocuments(query);

    const prompts = await db
      .collection("prompts")
      .find(query)
      .sort(order)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .toArray();

    res.json({
      success: true,
      prompts,

      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage),
        hasNext: currentPage < Math.ceil(total / perPage),
        hasPrev: currentPage > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const copyPrompt = async (req, res) => {
  try {
    const db = getDB();

    await db.collection("prompts").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $inc: {
          copyCount: 1,
        },
      }
    );

    res.json({
      success: true,
      message: "Copied",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addReview = async (req, res) => {
  try {
    const db = getDB();

    const { rating, comment } = req.body;

    const exists = await db.collection("reviews").findOne({
      promptId: req.params.id,
      userEmail: req.user.email,
    });

    if (exists) {
      return res.status(400).json({
        message: "Already reviewed",
      });
    }

    await db.collection("reviews").insertOne({
      promptId: req.params.id,
      userEmail: req.user.email,
      name: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    });

    const reviews = await db.collection("reviews").find({
      promptId: req.params.id,
    }).toArray();

    const avg =
      reviews.reduce((a, b) => a + b.rating, 0) /
      reviews.length;

    await db.collection("prompts").updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          rating: avg,
          reviewCount: reviews.length,
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


const getReviews = async (req, res) => {
  try {
    const db = getDB();

    const reviews = await db
      .collection("reviews")
      .find({
        promptId: req.params.id,
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const reportPrompt = async (req, res) => {
  try {
    const db = getDB();

    const exists = await db.collection("reports").findOne({
      promptId: req.params.id,
      userEmail: req.user.email,
    });

    if (exists) {
      return res.status(400).json({
        message: "Already reported",
      });
    }

    await db.collection("reports").insertOne({
      promptId: req.params.id,
      userEmail: req.user.email,
      name: req.user.name,
      reason: req.body.reason || "No reason",
      status: "pending",
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: "Reported successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFeaturedPrompts = async (req, res) => {
  try {
    const db = getDB();

    const prompts = await db
      .collection("prompts")
      .find({
        status: "approved",
      })
      .sort({
        copyCount: -1,
        rating: -1,
        createdAt: -1,
      })
      .limit(6)
      .toArray();

    res.json({
      success: true,
      prompts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const db = getDB();

    const categories = await db
      .collection("prompts")
      .aggregate([
        {
          $match: {
            status: "approved",
          },
        },
        {
          $group: {
            _id: "$category",
            totalPrompts: {
              $sum: 1,
            },
            totalCopies: {
              $sum: "$copyCount",
            },
            averageRating: {
              $avg: "$rating",
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id",
            totalPrompts: 1,
            totalCopies: 1,
            averageRating: {
              $round: ["$averageRating", 1],
            },
          },
        },
        {
          $sort: {
            totalPrompts: -1,
          },
        },
      ])
      .toArray();

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getTopCreators = async (req, res) => {
  try {
    const db = getDB();

    const creators = await db
      .collection("prompts")
      .aggregate([
        {
          $match: {
            status: "approved",
          },
        },
        {
          $group: {
            _id: "$creatorEmail",
            name: {
              $first: "$creatorName",
            },
            email: {
              $first: "$creatorEmail",
            },
            prompts: {
              $sum: 1,
            },
            sales: {
              $sum: 0,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "email",
            foreignField: "email",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            prompts: 1,
            sales: 1,
            image: {
              $ifNull: [
                "$user.image",
                {
                  $ifNull: [
                    "$user.photoURL",
                    "$user.avatar",
                  ],
                },
              ],
            },
          },
        },
        {
          $sort: {
            prompts: -1,
          },
        },
        {
          $limit: 4,
        },
      ])
      .toArray();

    res.json({
      success: true,
      creators,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getNewUsers = async (req, res) => {
  try {
    const db = getDB();

    const users = await db
      .collection("users")
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(4)
      .project({
        name: 1,
        role: 1,
        image: 1,
        avatar: 1,
        photoURL: 1,
        profileImage: 1,
        createdAt: 1,
      })
      .toArray();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCreatorTopPrompts = async (req, res) => {
  try {
    const db = getDB();

    const prompts = await db
      .collection("prompts")
      .find({
        creatorEmail: req.user.email,
      })
      .sort({
        copyCount: -1,
        bookmarkCount: -1,
        rating: -1,
      })
      .limit(5)
      .project({
        title: 1,
        thumbnail: 1,
        status: 1,
        copyCount: 1,
        bookmarkCount: 1,
        rating: 1,
        reviewCount: 1,
      })
      .toArray();

    res.json({
      success: true,
      prompts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addPrompt,
  getMyPrompts,
  getSinglePrompt,
  deletePrompt,
  updatePrompt,
  getAllPromptsAdmin,
  approvePrompt,
  rejectPrompt,
  getAllPrompts,
  getFeaturedPrompts,
  copyPrompt,
  addReview,
  getReviews,
  getCategories,
  getTopCreators,
  getPromptStats,
  getNewUsers,
  getCreatorTopPrompts,
  reportPrompt,
};