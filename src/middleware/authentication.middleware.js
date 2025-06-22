import models from "../DB/models/index.models.js";
import { roles } from "../common/constants/roles.constants.js";
import { AppError, asyncHandler, verifyToken } from "../utils/index.utils.js";

export const isAuthenticated = (bearerKey) => {
  return asyncHandler(async (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth)
      return next(
        new AppError("Unauthorized: Missing authorization header.", 401)
      );

    if (!auth.startsWith(bearerKey)) {
      return next(new AppError("Invalid bearer token provided", 401));
    }
    const [_, token] = auth.split(" ");
    const decodedToken = verifyToken({ token });

    const user = await models.User.findById(decodedToken.id);

    // denied access if user is deleted
    if (user.deletedAt)
      return next(new AppError("Access denied account is deleted", 403));

    if (!user)
      //check user existence
      return next(
        new AppError(
          "Unauthorized: Access is denied due to invalid credentials.",
          401
        )
      );

    if (!user.role === decodedToken.role)
      return next(new AppError("Access denied: Invalid role provided.", 403));

    req.user = user;
    next();
  });
};
