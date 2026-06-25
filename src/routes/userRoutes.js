const router = require("express").Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  getAllUsers,
  changeRole,
  deleteUser,
} = require("../controllers/userController");

router.get("/me", protect, getProfile);

router.get("/profile", protect, getProfile);

router.patch("/profile", protect, updateProfile);

router.patch("/password", protect, updatePassword);

router.post( "/avatar",protect,upload.single("image"),uploadAvatar);

router.get(
  "/all",
  protect,
  authorize("admin"),
  getAllUsers
);

router.patch(
  "/role",
  protect,
  authorize("admin"),
  changeRole
);

router.delete(
  "/:email",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;