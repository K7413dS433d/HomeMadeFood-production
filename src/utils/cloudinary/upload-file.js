import { cloudinaryConfig } from "./index.cloudinary.js";

// uploadFile docs
/**
 * Uploads an image file to Cloudinary using the provided request and options.
 *
 * This function supports two types of uploads:
 * - **Local file upload**: Use `req.file` provided by `multer`.
 * - **Online image upload**: Set the image URL in `req.imageUrl`.
 *
 * After a successful upload, the Cloudinary response (`secure_url` and `public_id`)
 * is stored in `req.images`. This is useful for global error handling, allowing
 * the image to be deleted later if needed.
 *
 * @async
 * @function uploadFile
 * @param {Object} params - The parameters for the upload.
 * @param {Object} params.req - The request object.
 * @param {Object} [params.req.file] - The uploaded file object from `multer`.
 * @param {string} [params.req.imageUrl] - The URL of an online image to upload. Required if `req.file` is not present.
 * @param {Object} params.options - Upload options.
 * @param {string} params.options.folder - The target folder in Cloudinary.
 * @param {string} [params.options.fileName] - A custom public ID for the uploaded image.
 *
 * @returns {Promise<Object>} An object containing:
 * @property {string} secure_url - The secure URL of the uploaded image.
 * @property {string} public_id - The public ID of the uploaded image in Cloudinary.
 *
 */
export const uploadFile = async ({ req, options: { folder, fileName } }) => {
  //upload image
  const uploadOptions = {
    folder,
  };

  if (fileName) {
    uploadOptions.public_id = fileName;
  }
  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file?.path || req.imageUrl,
    uploadOptions
  );

  //catch images to delete from the cloud if there is an error
  //!related to global error handling file
  req.images = { secure_url, public_id };

  return { secure_url, public_id };
};
