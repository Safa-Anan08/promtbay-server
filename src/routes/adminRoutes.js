const router = require("express").Router();

const verifyToken = require("../middleware/verifyToken");

const {
  getReports,
  getPayments,
} = require("../controllers/adminController");

router.get(
  "/reports",
  verifyToken,
  getReports
);

router.get(
  "/payments",
  verifyToken,
  getPayments
);

module.exports = router;