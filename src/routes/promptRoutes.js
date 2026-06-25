const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");
const verifyCreators = require("../middleware/verifyCreators");
const optionalAuth = require("../middleware/optionalAuth");
const {
  addPrompt,
  getMyPrompts,
  getSinglePrompt,
  deletePrompt,
  updatePrompt,
  getAllPromptsAdmin,
  approvePrompt,
  rejectPrompt,
  getAllPrompts,
  copyPrompt,
  addReview,
  getReviews,
  getFeaturedPrompts,
  getCategories,
  getTopCreators,
  getPromptStats,
  getNewUsers,
  getCreatorTopPrompts,
  reportPrompt,
} = require("../controllers/promptController");

router.get("/admin/all", verifyToken, getAllPromptsAdmin);
router.get("/admin/stats", verifyToken, getPromptStats);
router.get("/admin/new-users", verifyToken, getNewUsers);
router.patch("/approve/:id", verifyToken, approvePrompt);
router.patch("/reject/:id", verifyToken, rejectPrompt);
router.get(
  "/creator/top-prompts",
  verifyToken,
  verifyCreators,
  getCreatorTopPrompts
);

router.post(
  "/",
  verifyToken,
  upload.single("image"),
  addPrompt
);

router.get("/mine", verifyToken, getMyPrompts);

router.get("/mine/:id", verifyToken, getSinglePrompt);
router.patch("/:id", verifyToken, updatePrompt);
router.delete("/:id", verifyToken, deletePrompt);
router.post("/review/:id", verifyToken, addReview);

router.get("/reviews/:id", getReviews);
router.post("/report/:id", verifyToken, reportPrompt);
router.get("/featured", getFeaturedPrompts);

router.get("/categories", getCategories);
router.get("/top-creators", getTopCreators);

router.get("/details/:id", optionalAuth, getSinglePrompt);

router.get("/", getAllPrompts);
module.exports = router;