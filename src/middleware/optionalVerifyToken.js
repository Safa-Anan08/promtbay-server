const jwt = require("jsonwebtoken");

const optionalVerifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = optionalVerifyToken;