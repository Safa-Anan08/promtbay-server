const router = require("express").Router();

const verifyToken = require("../middleware/verifyToken");

const upload  = require("../middleware/upload");

const {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
} = require("../controllers/profileController");

router.get(
  "/",
  verifyToken,
  getProfile
);

router.patch(
  "/",
  verifyToken,
  updateProfile
);

router.patch(
  "/password",
  verifyToken,
  updatePassword
);

router.post(
  "/avatar",
  verifyToken,
  upload.single("image"),
  uploadAvatar
);

module.exports = router;