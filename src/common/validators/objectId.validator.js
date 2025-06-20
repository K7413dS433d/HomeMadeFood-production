import { isValidObjectId } from "mongoose";
import joi from "joi";

export const objectIdValidator = (value, helper) => {
  if (isValidObjectId(value)) return true;
  return helper.message("invalid id");
};

export const objectIdSchema = joi.string().custom(objectIdValidator).required();
