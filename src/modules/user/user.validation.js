import joi from "joi";
import * as constants from "../../common/constants/index.constant.js";
import {
  fileValidatorType,
  latitudeValidator,
  locationSchema,
  locationValidator,
  longitudeValidator,
  objectIdSchema,
} from "../../common/validators/index.validators.js";

//update user
export const updateUserProfile = joi
  .object({
    firstName: joi.string(),
    lastName: joi.string(),
    language: joi.string().valid(...Object.values(constants.languages)),
    phone: joi
      .string()
      .pattern(constants.PHONE_REG)
      .message("Enter valid phone number"),
    file: fileValidatorType("image"),
  })
  .or("firstName", "lastName", "language", "phone", "file");

//update user email
export const updateEmail = joi
  .object({
    newEmail: joi.string().email().required(),
  })
  .required();

//update chef profile
export const updateChefProfile = joi
  .object({
    firstName: joi.string(),
    lastName: joi.string(),
    phone: joi
      .string()
      .pattern(constants.PHONE_REG)
      .message("Enter valid phone number"),
    displayName: joi.string(),
    description: joi.string(),
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
      .min(1),
    kitchenAddress: locationSchema.optional(),
    openSchedule: joi.object({
      days: joi
        .array()
        .items(joi.string().valid(...Object.values(constants.days)))
        .min(1),
      fromTime: joi
        .string()
        .pattern(constants.TIME_REG)
        .message("in valid time format"),
      toTime: joi
        .string()
        .pattern(constants.TIME_REG)
        .message("in valid time format"),
      autoOpenClose: joi.boolean(),
    }),

    file: fileValidatorType("image").optional(),
  })
  .required();

//get user profile
export const chefSchema = joi
  .object({
    chefId: objectIdSchema,
  })
  .required();

//update password
export const changePassword = joi
  .object({
    oldPassword: joi.string().required(),
    newPassword: joi
      .string()
      .pattern(constants.PASSWORD_REG)
      .message(
        "password must be 8 characters long and contain at least one lowercase letter,one uppercase letter,numbers,Special_Char"
      )
      .required(),
    confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
  })
  .required();

//get all chefs
export const getAllChefs = joi
  .object({
    page: joi.number(),
    limit: joi.number(),
    search: joi.string(),
  })
  .required();

//sales overview
export const salesOverview = joi
  .object({
    filter: joi
      .string()
      .valid(...Object.values(constants.salesOverview))
      .optional(),
  })
  .required();

//kitchen status
export const kitchenStatus = joi.object({
  kitchenStatus: joi
    .string()
    .valid(...Object.values(constants.kitchenStatus))
    .optional(),
});
