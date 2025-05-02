import { AppError } from "../index.utils.js";
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      return next(new AppError(err.message, 500));
    });
  };
};
