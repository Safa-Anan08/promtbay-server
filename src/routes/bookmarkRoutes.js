const router =
require("express").Router();

const verifyToken =
require("../middleware/verifyToken");

const {
toggleBookmark,
getBookmarks,
} =
require("../controllers/bookmarkController");

router.post(
"/:id",
verifyToken,
toggleBookmark
);

router.get(
"/mine",
verifyToken,
getBookmarks
);

module.exports =
router;