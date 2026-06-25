const router = require("express").Router();

const verifyToken = require("../middleware/verifyToken");

const { getDashboard } = require("../controllers/userDashboardController");

router.get("/", verifyToken, getDashboard);

module.exports = router;