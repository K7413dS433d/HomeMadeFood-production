import * as utils from "../utils/index.utils.js";

export const isAuthorized = (...roles) => {
  return utils.asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new utils.AppError("Unauthorized account", 401));
    next();
  });
};
