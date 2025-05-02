import models from "../DB/models/index.models.js";
import { AppError, asyncHandler } from "../utils/index.utils.js";

export const existence = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const isExist = await models.User.findOne({ email });
  if (isExist) return next(new AppError("Email already exist", 409));

  next();
});
