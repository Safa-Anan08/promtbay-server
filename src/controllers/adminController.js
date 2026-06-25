const { getDB } = require("../config/db");

const getReports = async (req, res) => {
  try {
    const db = getDB();

    const reports = await db
      .collection("reports")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(reports);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const db = getDB();

    const payments = await db
      .collection("payment_history")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getReports,
  getPayments,
};