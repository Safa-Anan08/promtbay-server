const router = require("express").Router();

const verifyToken = require("../middleware/verifyToken");

const {
  createCheckout,
  confirmPayment,
  getPaymentHistory,
} = require("../controllers/paymentController");

router.post(
  "/checkout",
  verifyToken,
  createCheckout
);

router.get(
  "/success/:sessionId",
  confirmPayment
);

router.get(
  "/history",
  verifyToken,
  getPaymentHistory
);

module.exports = router;