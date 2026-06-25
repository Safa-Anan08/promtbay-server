const router = require("express").Router();

const verifyToken = require("../middleware/verifyToken");

const {
  copyPrompt,
  getCopiedPrompts,
} = require("../controllers/copyController");

router.post("/:id", verifyToken, copyPrompt);

router.get("/mine", verifyToken, getCopiedPrompts);
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Copy route works",
  });
});
module.exports = router;