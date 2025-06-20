import joi from "joi";
import * as constants from "../../common/constants/index.constant.js";
import {
  fileValidatorType,
  objectIdSchema,
  objectIdValidator,
} from "../../common/validators/index.validators.js";

export const addMeal = joi
  .object({
    name: joi.string().required(),
    description: joi.string().required(),
    size: joi
      .string()
      .valid(...Object.values(constants.mealSize))
      .required(),
    spiceLevel: joi
      .string()
      .valid(...Object.values(constants.mealSpiceLevel))
      .required(),
    tags: joi.string(),
    category: joi
      .string()
      .valid(...Object.values(constants.mealCategory))
      .required(),
    price: joi.number().precision(4),
    file: joi.array().items(fileValidatorType("images").required()).required(),
    stock: joi.number().required().min(0).messages({
      "number.base": "Stock must be a number",
      "number.min": "Stock must be greater than or equal to 0",
    }),
    hiddenStatus: joi.boolean(),
  })
  .required();

//delete meal
export const deleteMeal = joi
  .object({
    id: objectIdSchema,
  })
  .required();

//add meal to fav
export const addMealToFav = joi
  .object({
    id: objectIdSchema,
  })
  .required();

//add meal to fav
export const removeMealFromFav = joi
  .object({
    id: objectIdSchema,
  })
  .required();

//get meals
export const getMeals = joi
  .object({
    page: joi.number(),
    limit: joi.number(),
  })
  .required();

//get all meals
export const getAllMeals = joi
  .object({
    page: joi.number(),
    limit: joi.number(),
    search: joi.string(),
    category: joi.string().valid(...Object.values(constants.mealCategory)),
    chef: joi.custom(objectIdValidator),
  })
  .required();

//update meal
export const updateMeal = joi
  .object({
    id: objectIdSchema.required(),
    name: joi.string(),
    description: joi.string(),
    size: joi.string().valid(...Object.values(constants.mealSize)),
    spiceLevel: joi.string().valid(...Object.values(constants.mealSpiceLevel)),
    tags: joi.string(),
    category: joi.string().valid(...Object.values(constants.mealCategory)),
    price: joi.number().precision(4),
    file: joi.array().items(fileValidatorType("images").required()),
    stock: joi.number().min(0).messages({
      "number.base": "Stock must be a number",
      "number.min": "Stock must be greater than or equal to 0",
    }),
    hiddenStatus: joi.boolean(),
  })
  .or(
    "name",
    "description",
    "size",
    "spiceLevel",
    "tags",
    "category",
    "price",
    "file",
    "hiddenStatus",
    "stock"
  )
  .required();

//similar meals
export const similarMeals = joi
  .object({
    file: fileValidatorType("file"),
  })
  .required();
