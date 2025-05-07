import { AppError } from "../utils/index.utils.js";

export const isVerified = (req, res, next) => {
  //check account verification
  if (!req.user.verified)
    return next(new AppError("Account verification required.", 401));

  next();
};
