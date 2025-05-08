import joi from "joi";
import * as constants from "../../common/constants/index.constant.js";
import * as validators from "../../common/validators/index.validators.js";

const primaryData = {
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  email: joi.string().required().email().pattern(constants.EMAIL_REG),
  phone:joi.string().pattern(constants.PHONE_REG).message("Enter valid phone number"),
  password: joi
    .string()
    .required()
    .pattern(constants.PASSWORD_REG)
    .message(
      "password must be 8 characters long and contain at least one lowercase letter,one uppercase letter,numbers,Special_Char"
    ),
  confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password.",
    "any.required": "Confirm password is required.",
  }),
  accountLanguage: joi.string().valid(...Object.values(constants.languages)),
  role: joi.string().valid(...Object.values(constants.roles)),
};

export const userSignUp = joi
  .object({
    ...primaryData,
  })
  .required();

export const chefSignUp = joi
  .object({
    ...primaryData,
    displayName: joi.string().required(),
    description: joi.string().required(),
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
      .required(),
    termsAccepted: joi.boolean().required().valid(true).messages({
      "any.only": "Terms and conditions must be accepted",
      "any.required": "Terms and conditions field is required",
    }),
    kitchenAddress: validators.locationSchema,
    openSchedule: joi.object({
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
    }),

    file: validators.fileValidatorType("image"),
  })
  .required();

export const logIn = joi
  .object({
    email: joi.string().required().email(),
    password: joi
      .string()
      .required()
  })
  .required();

export const verifyEmail = joi
  .object({
    otp: joi.string().required(),
    email: joi.string().required().email(),
  })
  .required();

export const sendOtp = joi
  .object({
    email: joi.string().required().email(),
  })
  .required();

export const changePassword = joi
  .object({
    email: joi.string().required().email(),
    otp: joi.string().required(),
    password: joi
      .string()
      .required()
      .pattern(constants.PASSWORD_REG)
      .message(
        "password must be 8 characters long and contain at least one lowercase letter,one uppercase letter,numbers,Special_Char"
      ),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();

export const newAccess = joi
  .object({
    refresh_token: joi.string().required(),
  })
  .required();
