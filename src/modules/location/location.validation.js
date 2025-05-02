import joi from "joi";
import { objectIdSchema } from "../../common/validators/index.validators.js";

//add location
export const addAddress = joi
  .object({
    addressName: joi.string().required().min(2).max(15).messages({
      "string.min": "Address name must be 2-15 characters.",
      "string.max": "Address name must be 2-15 characters.",
      "string.empty": "Address name is required.",
    }),

    address: joi.string(),

    longitude: joi.number().required(),

    latitude: joi.number().required(),

    default: joi.boolean(),
  })
  .required();

//delete location
export const deleteAddress = joi
  .object({
    id: objectIdSchema,
  })
  .required();

//update address
export const updateAddress = joi
  .object({
    id: objectIdSchema,
    addressName: joi.string().min(2).max(30),
    address: joi.string(),
    default: joi.boolean(),
  })
  .or("addressName", "address", "default");
