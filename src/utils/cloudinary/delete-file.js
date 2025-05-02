import { cloudinaryConfig } from "../index.utils.js";

//deleteFile docs
/**
 * Deletes a file from Cloudinary.
 * @param {string} publicId - The public ID of the file to be deleted.
 * @returns {Promise<void>} Resolves when the file is successfully deleted.
 */

export const deleteFile = async (publicId) => {
  await cloudinaryConfig().uploader.destroy(publicId);
};
