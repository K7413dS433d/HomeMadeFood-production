import { Router } from "express";
import { asyncHandler } from "../../utils/index.utils.js";
import { extensions } from "../../common/constants/index.constant.js";
import * as middlewares from "../../middleware/index.middlewares.js";
import * as authService from "./auth.service.js";
import * as authSchema from "./auth.validation.js";

const authRouter = Router();

//registration
authRouter.post(
  "/user/signUp",
  middlewares.validateSchema(authSchema.userSignUp),
  middlewares.existence,
  asyncHandler(authService.userSignUp)
);

authRouter.post(
  "/chef/signUp",
  middlewares.singleUploader({
    fieldName: "image",
    allowedExtensions: extensions.IMAGES,
  }),
  middlewares.formDataParser("openSchedule", "kitchenAddress", "paymentMethod"),
  middlewares.validateSchema(authSchema.chefSignUp),
  middlewares.existence,
  asyncHandler(authService.chefSignUp)
);

//logIn
authRouter.post(
  "/logIn",
  middlewares.validateSchema(authSchema.logIn),
  asyncHandler(authService.logIn)
);

//email verification
authRouter.patch(
  "/verify-email",
  middlewares.validateSchema(authSchema.verifyEmail),
  asyncHandler(authService.verifyEmail)
);

//resend otp
authRouter.post(
  "/send-otp",
  middlewares.validateSchema(authSchema.sendOtp),
  asyncHandler(authService.sendOtp)
);

//verify otp for password and change password
authRouter.patch(
  "/change-password",
  middlewares.validateSchema(authSchema.changePassword),
  asyncHandler(authService.changePassword)
);

//new access token
authRouter.post(
  "/access-generator",
  middlewares.validateSchema(authSchema.newAccess),
  asyncHandler(authService.newAccess)
);

//logIn with google
authRouter.post(
  "/google-authentication",
  middlewares.thirdPartyDataValidation,
  asyncHandler(authService.google)
);

//logIn With Facebook
authRouter.post(
  "/facebook-authentication",
  middlewares.thirdPartyDataValidation,
  asyncHandler(authService.facebook)
);

export default authRouter;
