import joi from "joi";
import * as constants from "../../common/constants/index.constant.js";
import { fileValidatorType } from "../../common/validators/index.validators.js";

//update user
export const updateProfile = joi
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
