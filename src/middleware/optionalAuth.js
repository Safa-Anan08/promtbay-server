const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = decoded;
    }

    next();
  } catch {
    next();
  }
};

module.exports = optionalAuth;