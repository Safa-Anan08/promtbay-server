const cloudinary =
  require("../config/cloudinary");

const { getDB } =
  require("../config/db");

const uploadResume =
  async (req, res) => {
    try {
      const db = getDB();

      const result =
        await new Promise(
          (resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: "raw",
                folder: "resumes",
              },
              (error, result) => {
                if (error)
                  reject(error);

                resolve(result);
              }
            ).end(req.file.buffer);
          }
        );

      await db
        .collection("users")
        .updateOne(
          {
            email:
              req.user.email,
          },
          {
            $set: {
              resume:
                result.secure_url,
            },
          }
        );

      res.json({
        success: true,
        url: result.secure_url,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

module.exports = {
  uploadResume,
};