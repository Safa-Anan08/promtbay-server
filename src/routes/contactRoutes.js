const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

const {
  sendMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/contactController");

router.post(
  "/",
  sendMessage
);

router.get(
  "/admin",
  verifyToken,
  getMessages
);

router.delete(
  "/:id",
  verifyToken,
  deleteMessage
);

module.exports = router;