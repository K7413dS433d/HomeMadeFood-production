import { deleteCloudDir } from "../../../utils/index.utils.js";

export const deleteMealImages = async function (next) {
  //construct array of publicIds
  if (this.images.length) {
    const publicIds = this.images.map((obj) => obj.public_id);
    await deleteCloudDir({ assetsArray: publicIds });
  }

  return next();
};
