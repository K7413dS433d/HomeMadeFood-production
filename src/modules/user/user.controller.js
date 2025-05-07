import { Router } from "express";
import * as userService from "./user.service.js";
import * as userValidation from "./user.validation.js";
import { extensions, roles } from "../../common/constants/index.constant.js";
import { asyncHandler } from "../../utils/index.utils.js";
import * as middlewares from "../../middleware/index.middlewares.js";

const userRouter = Router();

userRouter.patch(
  "/update-profile",
  middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
  middlewares.isAuthorized(roles.USER),
  middlewares.singleUploader({
    fieldName: "image",
    allowedExtensions: extensions.IMAGES,
  }),
  middlewares.validateSchema(userValidation.updateProfile),
  asyncHandler(userService.updateProfile)
);

userRouter.patch(
  "/update-email",
  middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
  middlewares.isAuthorized(roles.USER),
  middlewares.validateSchema(userValidation.updateEmail),
  asyncHandler(userService.updateEmail)
);

userRouter.delete(
  "/delete-account",
  middlewares.isAuthenticated(process.env.TOKEN_ALL_VALUE),
  middlewares.isAuthorized(roles.USER, roles.CHEF),
  asyncHandler(userService.deleteAccount)
);

userRouter.patch(
  "/change-password",
  middlewares.isAuthenticated(process.env.TOKEN_ALL_VALUE),
  middlewares.isAuthorized(roles.USER, roles.CHEF),
  middlewares.validateSchema(userValidation.changePassword),
  asyncHandler(userService.changePassword)
);

userRouter.put(
  "/switch-role",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER, roles.CHEF),
  middlewares.isVerified,
  middlewares.switchRoleDataValidation,
  asyncHandler(userService.switchRole)
);

export default userRouter;
