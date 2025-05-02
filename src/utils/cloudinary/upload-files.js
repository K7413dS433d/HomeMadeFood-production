import { cloudinaryConfig } from "./config/cloudinary.config.js";

//uploadFiles docs
/**
 * Uploads multiple image files to Cloudinary.
 *
 * @param {Object} params - The upload parameters.
 * @param {Object} params.req - The Express request object containing the files.
 * @param {Object} params.options - Cloudinary upload options.
 * @param {string} params.options.folder - The Cloudinary folder where files will be stored.
 * @returns {Promise<Array<{ secure_url: string, public_id: string }>>} A promise that resolves to an array of objects, each containing the secure URL and public ID of an uploaded file.
 * @note This function also stores the uploaded file details in `req.images`.
 */
export const uploadFiles = async ({ req, options: { folder } }) => {
  if (!req.files || req.files?.length === 0) {
    throw new Error("No files provided for upload.");
  }
  //init array for images
  const uploadedFiles = [];
  //upload whole images
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: folder,
      }
    );

    uploadedFiles.push({ secure_url, public_id });
  }

  req.images = uploadedFiles;

  return uploadedFiles;
};
