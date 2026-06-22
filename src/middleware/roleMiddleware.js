const recruiterOnly = (req, res, next) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({
      success: false,
      message: "Recruiter access only",
    });
  }

  next();
};

module.exports = recruiterOnly;