import joi from "joi";
import * as utils from "../utils/index.utils.js";
import * as constants from "../common/constants/index.constant.js";
import * as validators from "../common/validators/index.validators.js";
import models from "../DB/models/index.models.js";

const loginSchema = joi.object({
  accessToken: joi.string().required(),
});

const dataSchema = joi
  .object({
    role:joi.string().valid(...Object.values(constants.roles)).required(),
    accessToken: joi.string().required(),
    role: joi
      .string()
      .valid(...Object.values(constants.roles))
      .required(),
    firstName: joi.string(),
    lastName: joi.string(),
    phone: joi.string().pattern(constants.PHONE_REG).required(),
    displayName: joi.string().when("role", {
      is: constants.roles.CHEF,
      then: joi.required(),
      otherwise: joi.optional(),
    }),
    description: joi.string().when("role", {
      is: constants.roles.CHEF,
      then: joi.required(),
      otherwise: joi.optional(),
    }),
    facebookPageLink: joi
      .string()
      .pattern(constants.URL_REG)
      .message("facebook link not valid"),
    instagramPageLink: joi
      .string()
      .pattern(constants.URL_REG)
      .message("instagram link not valid"),
    paymentMethod: joi
      .array()
      .items(joi.string().valid(...Object.values(constants.paymentMethod)))
      .min(1)
      .when("role", {
        is: constants.roles.CHEF,
        then: joi.required(),
        otherwise: joi.optional(),
      }),
    termsAccepted: joi
      .boolean()
      .when("role", {
        is: constants.roles.CHEF,
        then: joi.required().valid(true),
        otherwise: joi.optional(),
      })
      .messages({
        "any.only": "Terms and conditions must be accepted",
        "any.required": "Terms and conditions field is required",
      }),
    kitchenAddress: validators.locationSchema.when("role", {
      is: constants.roles.CHEF,
      then: joi.required(),
      otherwise: joi.optional(),
    }),
    openSchedule: joi
      .object({
        days: joi
          .array()
          .items(joi.string().valid(...Object.values(constants.days)))
          .min(1)
          .required(),
        fromTime: joi
          .string()
          .required()
          .pattern(constants.TIME_REG)
          .message("in valid time format"),
        toTime: joi
          .string()
          .required()
          .pattern(constants.TIME_REG)
          .message("in valid time format"),
        autoOpenClose: joi.boolean(),
      })
      .when("role", {
        is: constants.roles.CHEF,
        then: joi.required(),
        otherwise: joi.optional(),
      }),
  })
  .required();

export const thirdPartyDataValidation = utils.asyncHandler(
  async (req, res, next) => {
    const { accessToken, role} = req.body;
    const [googleUser, facebookUser] = await Promise.all([
      utils.getGoogleUserProfile(accessToken),
      utils.getFacebookUserProfile(accessToken),
    ]);

    const userProfile = googleUser?.error
      ? facebookUser
      : facebookUser?.error
      ? googleUser
      : null;
    if (!userProfile) return next(new utils.AppError("Invalid token", 400));
    if (userProfile.error)
      return next(
        new utils.AppError(
          "Error validating access token: Session has expired",
          400
        )
      );

    const user = await models.User.findOne({ email: userProfile.email });

    let err;
    if (!user) {
      const { error } = dataSchema.validate(req.body, { abortEarly: false });
      err = error;
    } else {
      const { error } = loginSchema.validate(
        { accessToken },
        { abortEarly: false }
      );
      err = error;
    }
    if (err) {
      const errors = err.details.map((error) => error.message);
      return next(new utils.AppError(errors, 400));
    }

    req.thirdPartyUser = userProfile;
    next();
  }
);
