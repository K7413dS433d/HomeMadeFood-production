import { cloudinaryConfig } from "../index.utils.js";

// deleteCloudDir docs
/**
 * Deletes a directory and its assets from Cloudinary.
 *
 * @async
 * @function deleteCloudDir
 * @param {Object} options - The options for deleting the directory.
 * @param {string[]} options.assetsArray - An array of asset public IDs to be deleted.
 * @param {boolean} [options.dir=true] - Whether to delete the folder itself after deleting its assets.
 * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
 *
 */

export const deleteCloudDir = async ({ assetsArray, dir = true }) => {
  //get folder public id
  const dirPublicId = assetsArray[0].split("/").slice(0, -1).join("/");

  // Delete all resources in the folder
  if (assetsArray.length)
    await cloudinaryConfig().api.delete_resources(assetsArray, {
      type: "upload",
    });

  //delete folder itself
  if (dir) await cloudinaryConfig().api.delete_folder(dirPublicId);
};
