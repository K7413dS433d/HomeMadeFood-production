import { Router } from "express";
import * as userService from "./user.service.js";
import * as userValidation from "./user.validation.js";
import { extensions, roles } from "../../common/constants/index.constant.js";
import { asyncHandler } from "../../utils/index.utils.js";
import * as middlewares from "../../middleware/index.middlewares.js";

const userRouter = Router();

//update profile for user
userRouter.put(
  "/user/profile",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER),
  middlewares.isVerified,
  middlewares.singleUploader({
    fieldName: "image",
    allowedExtensions: extensions.IMAGES,
  }),
  middlewares.validateSchema(userValidation.updateUserProfile),
  asyncHandler(userService.updateUserProfile)
);

//update profile for chef
userRouter.put(
  "/chef/profile",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.CHEF),
  middlewares.isVerified,
  middlewares.singleUploader({
    fieldName: "image",
    allowedExtensions: extensions.IMAGES,
  }),
  middlewares.formDataParser("openSchedule", "kitchenAddress", "paymentMethod"),
  middlewares.validateSchema(userValidation.updateChefProfile),
  asyncHandler(userService.updateChefProfile)
);

//update your email, require confirmation
userRouter.patch(
  "/email",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER),
  middlewares.isVerified,
  middlewares.validateSchema(userValidation.updateEmail),
  asyncHandler(userService.updateEmail)
);

userRouter.delete(
  "/account",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER, roles.CHEF),
  middlewares.isVerified,
  asyncHandler(userService.deleteAccount)
);

userRouter.patch(
  "/password",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER, roles.CHEF),
  middlewares.isVerified,
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

//get chef profile
userRouter.get(
  "/chef/profile/:chefId",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER, roles.CHEF),
  middlewares.isVerified,
  middlewares.validateSchema(userValidation.chefSchema),
  asyncHandler(userService.getChefProfile)
);

//get logged in user profile
userRouter.get(
  "/profile",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER, roles.CHEF),
  middlewares.isVerified,
  asyncHandler(userService.getProfile)
);

//follow or unfollow chef
userRouter.post(
  "/following/chefs/:chefId",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER),
  middlewares.isVerified,
  middlewares.validateSchema(userValidation.chefSchema),
  asyncHandler(userService.chefFollowing)
);

//get followed chefs
userRouter.get(
  "/following/chefs",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER),
  middlewares.isVerified,
  asyncHandler(userService.getUserFollowing)
);

//get all chefs
userRouter.get(
  "/chefs",
  middlewares.isAuthenticated(process.env.BEARER_KEY),
  middlewares.isAuthorized(roles.USER),
  middlewares.isVerified,
  middlewares.validateSchema(userValidation.getAllChefs),
  asyncHandler(userService.getAllChefs)
);

export default userRouter;
