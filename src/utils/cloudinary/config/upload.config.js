import multer, { diskStorage } from "multer";
import { AppError } from "../../index.utils.js";

//cloudUpload docs
/**
 * Configures Multer for file uploads with optional allowed file types.
 * @param {string[]} [allowedFiles] - An optional array of allowed MIME types. If not provided, all files are accepted.
 * @returns {import("multer").Multer} A configured Multer instance for handling uploads.
 */

export const cloudUpload = (allowedFiles) => {
  const storage = diskStorage({}); //temp dir

  function fileFilter(req, file, cb) {
    //allowed filter optional
    if (!allowedFiles || allowedFiles.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Not supported file extension", 415), false);
    }
  }

  return multer({ storage, fileFilter });
};
